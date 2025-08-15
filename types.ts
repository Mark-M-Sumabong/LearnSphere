

export interface Lesson {
  title: string;
}

export interface Module {
  title: string;
  lessons: Lesson[];
}

export interface Course {
  id?: number; // Added from database
  title: string;
  description: string;
  modules: Module[];
}

export interface Question {
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface Quiz {
  title: string;
  questions: Question[];
}

export interface QuizResults {
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  userAnswers: number[];
  isPassed: boolean;
}

export type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced';

// User and Auth types
export interface User {
  id: string; // From Supabase Auth
  email: string | undefined;
  profile: Profile | null;
}

export interface Profile {
  username: string;
  role: 'user' | 'admin';
  updated_at: string;
}

export interface ProfileWithId extends Profile {
  id: string;
}

export interface LeaderboardEntry {
  username: string;
  score: number;
  timestamp: number;
}

export interface AssessmentResult {
  username: string;
  topic: string;
  score: number;
  skillLevel: SkillLevel;
  timestamp: number;
}

export interface QuizAttempt {
  id: number;
  module_title: string;
  score: number;
  passed: boolean;
  attempted_at: string;
  courses: { title: string } | null;
}


export interface AppState {
    course: Course | null;
    unlockedModules: number[];
    completedLessons: string[];
    skillLevel: SkillLevel | null;
}

export interface ActiveQuizState {
  userAnswers: number[];
  currentQuestionIndex: number;
  timeLeft: number | null;
}

// For saving the exact view state to localStorage to persist across refreshes
export interface SessionState {
    course: Course | null;
    selectedLessonTitle: string | null;
    unlockedModules: number[];
    completedLessons: string[];
    userSkillLevel: SkillLevel | null;
    activeQuiz: Quiz | null;
    quizResults: QuizResults | null;
    currentModuleIndexForQuiz: number | null;
    activeQuizState: ActiveQuizState | null;
}

// VFS Types for CLI Sandbox
export interface VFSFile {
  type: 'file';
  content: string;
}

export interface VFSDirectory {
  type: 'directory';
  children: { [name: string]: VFSNode };
}

export type VFSNode = VFSFile | VFSDirectory;

export type VFS = { [name: string]: VFSNode };

export interface CommandHistoryEntry {
  command: string;
  output: any;
  path: string;
}
