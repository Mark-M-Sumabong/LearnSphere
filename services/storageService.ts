
import { Course, LeaderboardEntry, SkillLevel, AssessmentResult, AppState, ProfileWithId, QuizAttempt } from '../types';
import { getSupabaseClient } from './supabaseClient';
import { Json } from './supabaseClient';

// This file is now a service layer for Supabase.
// The "storage" name is kept for simplicity to avoid refactoring all imports in App.tsx.


// This new function centralizes course creation via a secure database RPC call.
// It assumes a PostgreSQL function 'create_course_and_get_id' exists in the Supabase project.
const createNewCourseViaRpc = async (course: Course): Promise<number | null> => {
    const supabase = getSupabaseClient();
    
    // The RPC function is the recommended way to handle inserts that need to bypass
    // standard RLS policies in a controlled manner.
    // The parameter names (p_course_data, p_course_title) are chosen to be
    // alphabetically sorted, matching the signature of the corrected database function,
    // which prevents errors from the client library reordering them.
    const { data, error } = await supabase.rpc('create_course_and_get_id', {
        p_course_data: course,
        p_course_title: course.title,
    });

    if (error) {
        console.error("Error creating course via RPC:", error);
        // Provide a more specific error message for the developer.
        throw new Error(`Database operation failed. Ensure the 'create_course_and_get_id(p_course_data jsonb, p_course_title text)' RPC function is correctly set up in your Supabase project. Original error: ${error.message}`);
    }

    return data;
}


// --- User State Management ---

export const saveUserState = async (userId: string, state: AppState): Promise<void> => {
    if (!state.course) return;
    const supabase = getSupabaseClient();

    let courseId = state.course.id;

    // 1. Check if course exists, if not, create it
    if (!courseId) {
        const { data: existingCourse, error: findError } = await supabase
            .from('courses')
            .select('id')
            .eq('title', state.course.title)
            .maybeSingle();

        if (findError) {
            console.error("Error finding course:", findError);
            return;
        }

        if (existingCourse) {
            courseId = existingCourse.id;
            state.course.id = courseId;
        } else {
            // Course does not exist, create it using the secure RPC function.
            try {
                const newCourseId = await createNewCourseViaRpc(state.course);
                if (newCourseId) {
                    courseId = newCourseId;
                    state.course.id = newCourseId; // Update in-memory object with the new ID
                } else {
                    console.error("Course creation RPC returned no ID.");
                    return;
                }
            } catch (creationError) {
                console.error("Failed to execute course creation workflow:", creationError);
                // In a real app, you might want to surface this error to the user.
                return; // Stop execution if course can't be created.
            }
        }
    }
    
    if (!courseId) {
        console.error("Could not get or create a course ID.");
        return;
    }

    // 2. Upsert user progress
    const progressToUpsert = {
        user_id: userId,
        course_id: courseId,
        unlocked_modules: state.unlockedModules,
        skill_level: state.skillLevel,
        last_updated_at: new Date().toISOString()
    };
    const { error } = await supabase
        .from('user_progress')
        .upsert(progressToUpsert as any, { onConflict: 'user_id, course_id' });
    
    if (error) {
        console.error("Error saving user state:", error);
    }
};

export const loadUserState = async (userId: string): Promise<AppState | null> => {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
        .from('user_progress')
        .select('course_id, unlocked_modules, skill_level, courses ( course_data )')
        .eq('user_id', userId)
        .order('last_updated_at', { ascending: false })
        .limit(1)
        .single();
    
    if (error && error.code !== 'PGRST116') {
        console.error("Error loading user state:", error);
        return null;
    }
    if (!data) {
        return null;
    }
    
    const anyData = data as any;
    const coursesData = anyData.courses;

    if (!coursesData || Array.isArray(coursesData)) {
        console.error("User progress found, but the associated course is missing or invalid.");
        return null;
    }

    const courseData = coursesData.course_data as Course;

    // Additional validation to ensure course_data is a valid course object
    if (!courseData || typeof courseData.title !== 'string' || !Array.isArray(courseData.modules)) {
         console.error("User progress found, but the course_data within the course is malformed or missing.", courseData);
         return null;
    }

    return {
        course: { ...(courseData), id: anyData.course_id },
        unlockedModules: anyData.unlocked_modules as number[],
        skillLevel: anyData.skill_level as SkillLevel | null
    };
};

// --- Leaderboard Management ---

export const getLeaderboard = async (courseId: number): Promise<LeaderboardEntry[]> => {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
        .from('leaderboard')
        .select('score, timestamp, profiles(username)')
        .eq('course_id', courseId)
        .order('score', { ascending: false })
        .order('timestamp', { ascending: true });

    if (error) {
        console.error("Error getting leaderboard:", error);
        return [];
    }

    if (!data) {
        return [];
    }

    return data.map(entry => {
        const anyEntry = entry as any;
        return {
            username: anyEntry.profiles?.username || 'Anonymous',
            score: anyEntry.score,
            timestamp: new Date(anyEntry.timestamp).getTime()
        }
    });
};

export const addLeaderboardEntry = async (courseId: number, userId: string, score: number): Promise<void> => {
    const supabase = getSupabaseClient();

    // First, get the current score to ensure we only update if the new score is higher
    const { data: existingEntry } = await supabase
        .from('leaderboard')
        .select('score')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .maybeSingle();

    // Only upsert if there's no existing entry or the new score is an improvement
    if (!existingEntry || score > (existingEntry as any).score) {
        const entryToUpsert = {
            course_id: courseId,
            user_id: userId,
            score,
            timestamp: new Date().toISOString()
        };
        const { error: upsertError } = await supabase
            .from('leaderboard')
            .upsert(entryToUpsert as any, {
                onConflict: 'user_id, course_id',
            });

        if (upsertError) {
            console.error("Error adding leaderboard entry:", upsertError);
        }
    }
};

// --- Quiz & Assessment Management ---

export const saveQuizAttempt = async (data: { userId: string, courseId: number, moduleTitle: string, score: number, passed: boolean }): Promise<void> => {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from('quiz_attempts').insert({
        user_id: data.userId,
        course_id: data.courseId,
        module_title: data.moduleTitle,
        score: data.score,
        passed: data.passed,
    } as any);
    if (error) {
        console.error("Error saving quiz attempt:", error);
    }
};

export const getAllAssessmentResults = async (): Promise<AssessmentResult[]> => {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
        .from('assessments')
        .select('topic, score, skill_level, created_at, profiles(username)')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error getting all assessment results:", error);
        return [];
    }
    
    if (!data) {
        return [];
    }
    
    return data.map(result => {
        const anyResult = result as any;
        return {
            username: anyResult.profiles?.username || 'Anonymous',
            topic: anyResult.topic,
            score: anyResult.score,
            skillLevel: anyResult.skill_level as SkillLevel,
            timestamp: new Date(anyResult.created_at).getTime()
        }
    });
};


export const getUserAssessmentResults = async (userId: string): Promise<Omit<AssessmentResult, 'username'>[]> => {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
        .from('assessments')
        .select('topic, score, skill_level, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
    
    if (error) {
        console.error('Error fetching user assessment results:', error);
        return [];
    }
    
    return (data || []).map(result => {
        const anyResult = result as any;
        return {
            topic: anyResult.topic,
            score: anyResult.score,
            skillLevel: anyResult.skill_level as SkillLevel,
            timestamp: new Date(anyResult.created_at).getTime()
        }
    });
};

export const getUserQuizAttempts = async (userId: string): Promise<QuizAttempt[]> => {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
        .from('quiz_attempts')
        .select('id, module_title, score, passed, attempted_at, courses!quiz_attempts_course_id_fkey(title)')
        .eq('user_id', userId)
        .order('attempted_at', { ascending: false });
    
    if (error) {
        console.error('Error fetching user quiz attempts:', error);
        return [];
    }

    return (data as any) || [];
};

export const saveAssessmentResult = async (userId: string, result: Omit<AssessmentResult, 'username' | 'timestamp'>): Promise<void> => {
    const supabase = getSupabaseClient();
    const assessmentToInsert = {
        user_id: userId,
        topic: result.topic,
        score: result.score,
        skill_level: result.skillLevel
    };
    const { error } = await supabase
        .from('assessments')
        .insert(assessmentToInsert as any);

    if (error) {
        console.error("Error saving assessment result:", error);
    }
};

// --- Admin & Data Management ---

export const getAllProfiles = async (): Promise<ProfileWithId[]> => {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('username', { ascending: true });

    if (error) {
        console.error("Error fetching all profiles:", error);
        return [];
    }
    return (data as any) || [];
};

export const importCourseToDb = async (course: Course): Promise<Course | null> => {
    const supabase = getSupabaseClient();
    const courseToInsert = {
         title: course.title, 
         course_data: course
    };
    const { data, error } = await supabase
        .from('courses')
        .insert(courseToInsert as any)
        .select()
        .single();
        
    if (error || !data) {
        if(error) console.error("Error importing course to DB:", error);
        return null;
    }
    
    const anyData = data as any;
    return { ...(anyData.course_data as Course), id: anyData.id };
}

export const getAllCoursesForAdmin = async (): Promise<{ title: string; id: number }[]> => {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
        .from('courses')
        .select('id, title');
    
    if (error) {
        console.error("Error fetching courses for admin:", error);
        return [];
    }

    return (data as any) || [];
}

export const getLeaderboardForAdmin = async (courseId: number): Promise<{ title: string; entries: LeaderboardEntry[] } | null> => {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from('courses').select('title').eq('id', courseId).single();
    if (error || !data) {
        if (error) console.error("Error fetching leaderboard for admin:", error);
        return null;
    }
    
    const entries = await getLeaderboard(courseId);
    return { title: (data as any).title, entries };
}
