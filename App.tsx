

import React, { useState, useCallback, useEffect, useMemo, useContext } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { CourseDisplay } from './components/CourseDisplay';
import { QuizView } from './components/QuizView';
import { QuizResult } from './components/QuizResult';
import { generateCurriculum, generateLessonContent, generateQuiz, generateAssessment, evaluateAssessment, generateStudyLink } from './services/geminiService';
import * as storage from './services/storageService';
import { Course, Lesson, Quiz, QuizResults, SkillLevel, SessionState, ActiveQuizState, AppState } from './types';
import { Spinner } from './components/ui/Spinner';
import { Login } from './components/Login';
import { Leaderboard } from './components/Leaderboard';
import { UserContext } from './contexts/UserContext';
import { AskTutor } from './components/AskTutor';
import { AskTutorButton } from './components/AskTutorButton';
import { AssessmentPrompt } from './components/AssessmentPrompt';
import { AdminDashboard } from './components/AdminDashboard';
import { ConfigurationErrorScreen } from './components/ConfigurationErrorScreen';
import { ContinueCourse } from './components/ContinueCourse';
import { AssessmentResultModal } from './components/AssessmentResultModal';

const QUIZ_PASS_PERCENTAGE = 0.6; // 60%

const App: React.FC = () => {
  const userContext = useContext(UserContext);
  
  // App State
  const [course, setCourse] = useState<Course | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [lessonContent, setLessonContent] = useState<string>('');
  
  // UI State
  const [isAppLoading, setIsAppLoading] = useState<boolean>(true);
  const [isLoadingCurriculum, setIsLoadingCurriculum] = useState<boolean>(false);
  const [isLoadingLesson, setIsLoadingLesson] = useState<boolean>(false);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);
  const [isTutorOpen, setIsTutorOpen] = useState<boolean>(false);
  const [showContinuePrompt, setShowContinuePrompt] = useState<boolean>(false);

  // Quiz & Progress State
  const [unlockedModules, setUnlockedModules] = useState<Set<number>>(new Set([0]));
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [quizResults, setQuizResults] = useState<QuizResults | null>(null);
  const [currentModuleIndexForQuiz, setCurrentModuleIndexForQuiz] = useState<number | null>(null);
  const [activeQuizState, setActiveQuizState] = useState<ActiveQuizState | null>(null);

  // Assessment State
  const [topicForCourseGeneration, setTopicForCourseGeneration] = useState<string | null>(null);
  const [showAssessmentPrompt, setShowAssessmentPrompt] = useState<boolean>(false);
  const [activeAssessment, setActiveAssessment] = useState<Quiz | null>(null);
  const [isGeneratingAssessment, setIsGeneratingAssessment] = useState<boolean>(false);
  const [isEvaluatingAssessment, setIsEvaluatingAssessment] = useState<boolean>(false);
  const [userSkillLevel, setUserSkillLevel] = useState<SkillLevel | null>(null);
  const [assessmentResultToShow, setAssessmentResultToShow] = useState<{ score: number; skillLevel: SkillLevel } | null>(null);

  // Admin State
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);

  const resetState = (fullReset: boolean) => {
    if (fullReset) {
      setCourse(null);
      setUserSkillLevel(null);
      setUnlockedModules(new Set([0]));
      setCompletedLessons(new Set());
    }
    setSelectedLesson(null);
    setLessonContent('');
    setActiveQuiz(null);
    setQuizResults(null);
    setCurrentModuleIndexForQuiz(null);
    setError(null);
    setTopicForCourseGeneration(null);
    setShowAssessmentPrompt(false);
    setActiveAssessment(null);
    setShowContinuePrompt(false);
    setActiveQuizState(null);
    setAssessmentResultToShow(null);
    // Clear session storage for the current user to ensure a fresh start
    if (userContext?.currentUser?.id) {
      localStorage.removeItem(`learnsphere-session-${userContext.currentUser.id}`);
    }
  };

  // This effect loads application state. It prioritizes restoring a session from
  // localStorage, and falls back to loading general progress from Supabase.
  useEffect(() => {
    if (userContext?.isLoading || userContext?.configError) {
      return;
    }

    const loadAppData = async () => {
      setIsAppLoading(true);
      try {
        if (userContext?.currentUser) {
          setIsAdmin(userContext.currentUser.profile?.role === 'admin');
          
          const sessionDataString = localStorage.getItem(`learnsphere-session-${userContext.currentUser.id}`);

          if (sessionDataString) {
            // Restore exact state from localStorage session
            const sessionData: SessionState = JSON.parse(sessionDataString);
            
            setCourse(sessionData.course);
            setUnlockedModules(new Set(sessionData.unlockedModules || [0]));
            setCompletedLessons(new Set(sessionData.completedLessons || []));
            setUserSkillLevel(sessionData.userSkillLevel || null);
            setActiveQuiz(sessionData.activeQuiz || null);
            setQuizResults(sessionData.quizResults || null);
            setCurrentModuleIndexForQuiz(sessionData.currentModuleIndexForQuiz || null);
            setActiveQuizState(sessionData.activeQuizState || null);
            
            if (sessionData.course && sessionData.selectedLessonTitle) {
              const lesson = sessionData.course.modules
                .flatMap(m => m.lessons)
                .find(l => l.title === sessionData.selectedLessonTitle);
              if (lesson) {
                setSelectedLesson(lesson);
              }
            }
            setShowContinuePrompt(false); // We are restoring the exact state, no need for prompt.
          } else {
            // Fallback to loading long-term progress from Supabase
            const savedState = await storage.loadUserState(userContext.currentUser.id);
            if (savedState && savedState.course) {
              setCourse(savedState.course);
              const modules = Array.isArray(savedState.unlockedModules) && savedState.unlockedModules.length > 0 ? savedState.unlockedModules : [0];
              setUnlockedModules(new Set(modules));
              setCompletedLessons(new Set(savedState.completedLessons || []));
              setUserSkillLevel(savedState.skillLevel || null);
              setShowContinuePrompt(true);
              setSelectedLesson(null);
            } else {
              resetState(true);
            }
          }
        } else {
          resetState(true);
          setIsAdmin(false);
          setShowAdminDashboard(false);
        }
      } catch (e) {
        console.error("Failed to load application state:", e);
        setError("An error occurred while loading your session. The application has been reset.");
        if (userContext?.currentUser?.id) {
          localStorage.removeItem(`learnsphere-session-${userContext.currentUser.id}`);
        }
        resetState(true);
      } finally {
        setIsAppLoading(false);
      }
    };

    loadAppData();
  }, [userContext?.currentUser?.id, userContext?.isLoading, userContext?.configError]);
  
  // Save long-term user progress to Supabase
  useEffect(() => {
    if (userContext?.currentUser && course && !userContext?.configError && !isAppLoading) {
        storage.saveUserState(userContext.currentUser.id, {
            course,
            unlockedModules: Array.from(unlockedModules),
            completedLessons: Array.from(completedLessons),
            skillLevel: userSkillLevel,
        });
    }
  }, [course, unlockedModules, completedLessons, userContext?.currentUser, userContext?.configError, userSkillLevel, isAppLoading]);

  // Save current session state to localStorage on change for persistence across refreshes
  useEffect(() => {
    if (userContext?.currentUser && !isAppLoading && !userContext.isLoading) {
        const sessionState: SessionState = {
            course,
            selectedLessonTitle: selectedLesson?.title || null,
            unlockedModules: Array.from(unlockedModules),
            completedLessons: Array.from(completedLessons),
            userSkillLevel,
            activeQuiz,
            quizResults,
            currentModuleIndexForQuiz,
            activeQuizState,
        };
        localStorage.setItem(`learnsphere-session-${userContext.currentUser.id}`, JSON.stringify(sessionState));
    }
  }, [
    course, 
    selectedLesson, 
    unlockedModules,
    completedLessons,
    userSkillLevel, 
    activeQuiz, 
    quizResults, 
    currentModuleIndexForQuiz, 
    activeQuizState,
    userContext?.currentUser,
    isAppLoading,
    userContext?.isLoading
  ]);


  const handleGoHome = useCallback(() => {
    resetState(false);
    if (course) {
      setShowContinuePrompt(true);
    }
  }, [course]);

  const startCourseGeneration = useCallback(async (topic: string, skillLevel: SkillLevel) => {
    setIsLoadingCurriculum(true);

    if (!userContext?.currentUser) {
        setError("You must be logged in to generate a course.");
        setIsLoadingCurriculum(false);
        return;
    }
    
    setShowAssessmentPrompt(false);
    setActiveAssessment(null);
    setActiveQuizState(null);
    setError(null);

    try {
      const curriculum = await generateCurriculum(topic, skillLevel);
      
      const initialState: AppState = {
          course: curriculum,
          unlockedModules: [0],
          completedLessons: [],
          skillLevel: skillLevel,
      };
      
      // Await saving to get the course ID back
      await storage.saveUserState(userContext.currentUser.id, initialState);
      
      // Set state with the complete course object, now including the ID
      setCourse(initialState.course);
      setUserSkillLevel(initialState.skillLevel);
      setUnlockedModules(new Set(initialState.unlockedModules));
      setCompletedLessons(new Set(initialState.completedLessons));
      
      if (initialState.course.modules.length > 0 && initialState.course.modules[0].lessons.length > 0) {
        setSelectedLesson(initialState.course.modules[0].lessons[0]);
      } else {
        setSelectedLesson(null);
      }
    } catch (e) {
      console.error(e);
      setError('Failed to generate curriculum. Please try another topic.');
    } finally {
      setIsLoadingCurriculum(false);
      setTopicForCourseGeneration(null);
    }
  }, [userContext]);

  const handleGenerateCourseRequest = useCallback((topic: string) => {
    resetState(true);
    setTopicForCourseGeneration(topic);
    setShowAssessmentPrompt(true);
  }, []);

  const handleStartAssessment = useCallback(async () => {
    if (!topicForCourseGeneration) return;
    setShowAssessmentPrompt(false);
    setIsGeneratingAssessment(true);
    setError(null);
    setActiveQuizState(null); // Reset any previous quiz state

    try {
      const assessmentQuiz = await generateAssessment(topicForCourseGeneration);
      setActiveAssessment(assessmentQuiz);
    } catch (e) {
      console.error(e);
      setError("Failed to generate the assessment. Please try again.");
    } finally {
      setIsGeneratingAssessment(false);
    }
  }, [topicForCourseGeneration]);

  const handleSkipAssessment = useCallback(() => {
    if (!topicForCourseGeneration) return;
    startCourseGeneration(topicForCourseGeneration, 'Beginner');
  }, [topicForCourseGeneration, startCourseGeneration]);

  const handleAssessmentSubmit = useCallback(async (userAnswers: number[]) => {
    if (!activeAssessment || !topicForCourseGeneration || !userContext?.currentUser) return;

    let correctCount = 0;
    activeAssessment.questions.forEach((q, index) => {
      if (q.correctAnswerIndex === userAnswers[index]) {
        correctCount++;
      }
    });
    const score = correctCount / activeAssessment.questions.length;
    
    setActiveAssessment(null);
    setActiveQuizState(null);
    setIsEvaluatingAssessment(true);
    setError(null);
    
    try {
      const skillLevel = await evaluateAssessment(topicForCourseGeneration, score);
      
      await storage.saveAssessmentResult(userContext.currentUser.id, {
        topic: topicForCourseGeneration,
        score,
        skillLevel,
      });

      setUserSkillLevel(skillLevel);
      setAssessmentResultToShow({ score, skillLevel });

    } catch (e) {
      console.error("Failed to evaluate assessment or generate course:", e);
      setError("There was an error personalizing your course. Starting a beginner course instead.");
      await startCourseGeneration(topicForCourseGeneration, 'Beginner');
    } finally {
      setIsEvaluatingAssessment(false);
    }
  }, [activeAssessment, topicForCourseGeneration, startCourseGeneration, userContext?.currentUser]);
  
  const handleAssessmentSurrender = useCallback(() => {
    if (!topicForCourseGeneration) return;
    startCourseGeneration(topicForCourseGeneration, 'Beginner');
  }, [topicForCourseGeneration, startCourseGeneration]);


  const handleSelectLesson = useCallback((lesson: Lesson) => {
    // Automatically mark the previously selected lesson as complete
    if (selectedLesson && selectedLesson.title !== lesson.title) {
        setCompletedLessons(prev => {
            const newSet = new Set(prev);
            newSet.add(selectedLesson.title);
            return newSet;
        });
    }

    setSelectedLesson(lesson);
    setQuizResults(null);
    setActiveQuiz(null);
    setActiveQuizState(null);
  }, [selectedLesson]);

  useEffect(() => {
    const fetchLessonContent = async () => {
      if (!selectedLesson || !course) return;
      setIsLoadingLesson(true);
      setError(null);
      setLessonContent('');
      try {
        const content = await generateLessonContent(course.title, selectedLesson.title);
        setLessonContent(content);
      } catch (e) {
        console.error(e);
        setError('Failed to generate lesson content. Please try again.');
        setLessonContent('');
      } finally {
        setIsLoadingLesson(false);
      }
    };
    fetchLessonContent();
  }, [selectedLesson, course]);

  const { currentModuleIndex, isLastLessonInModule, shouldShowStartQuiz } = useMemo(() => {
    if (!course || !selectedLesson) return { currentModuleIndex: null, isLastLessonInModule: false, shouldShowStartQuiz: false };
    
    const moduleIndex = course.modules.findIndex(m => m.lessons.some(l => l.title === selectedLesson.title));
    if (moduleIndex === -1) return { currentModuleIndex: null, isLastLessonInModule: false, shouldShowStartQuiz: false };

    const module = course.modules[moduleIndex];
    const lessonIndex = module.lessons.findIndex(l => l.title === selectedLesson.title);
    const isLastLesson = lessonIndex === module.lessons.length - 1;
    const isLastModule = moduleIndex === course.modules.length - 1;
    const isNextModuleLocked = !unlockedModules.has(moduleIndex + 1);

    return {
      currentModuleIndex: moduleIndex,
      isLastLessonInModule: isLastLesson,
      shouldShowStartQuiz: isLastLesson && !isLastModule && isNextModuleLocked
    };
  }, [course, selectedLesson, unlockedModules]);

  const handleStartQuiz = useCallback(async () => {
    if (currentModuleIndex === null || !course) return;
    
    // Mark all lessons in the current module as complete before starting quiz
    const lessonsToComplete = course.modules[currentModuleIndex].lessons.map(l => l.title);
    setCompletedLessons(prev => new Set([...prev, ...lessonsToComplete]));

    setIsGeneratingQuiz(true);
    setError(null);
    setLessonContent(''); // Hide lesson content
    setActiveQuizState(null); // Reset any previous quiz state
    
    try {
      const moduleToTest = course.modules[currentModuleIndex];
      const quiz = await generateQuiz(course.title, moduleToTest);
      setActiveQuiz(quiz);
      setCurrentModuleIndexForQuiz(currentModuleIndex);
    } catch (e) {
      console.error(e);
      setError('Failed to generate the quiz. Please try again.');
    } finally {
      setIsGeneratingQuiz(false);
    }
  }, [currentModuleIndex, course]);
  
  const handleQuizSubmit = useCallback(async (userAnswers: number[]) => {
    if (!activeQuiz || !course || !userContext?.currentUser || !course.id || currentModuleIndexForQuiz === null) return;
    
    let correctCount = 0;
    activeQuiz.questions.forEach((q, index) => {
      if (q.correctAnswerIndex === userAnswers[index]) {
        correctCount++;
      }
    });

    const score = correctCount / activeQuiz.questions.length;
    const results: QuizResults = {
      userAnswers,
      correctAnswers: correctCount,
      totalQuestions: activeQuiz.questions.length,
      score,
      isPassed: score >= QUIZ_PASS_PERCENTAGE
    };
    
    setQuizResults(results);
    setActiveQuizState(null); // Quiz is complete, clear its state

    // Save every quiz attempt for admin tracking
    const moduleTitle = course.modules[currentModuleIndexForQuiz].title;
    await storage.saveQuizAttempt({
      userId: userContext.currentUser.id,
      courseId: course.id,
      moduleTitle,
      score: results.score,
      passed: results.isPassed,
    });

    if (results.isPassed) {
        setUnlockedModules(prev => new Set(prev).add(currentModuleIndexForQuiz + 1));
        await storage.addLeaderboardEntry(course.id, userContext.currentUser.id);
    }
  }, [activeQuiz, currentModuleIndexForQuiz, course, userContext?.currentUser]);
  
  const handleContinue = useCallback(() => {
    setActiveQuiz(null);
    setQuizResults(null);
    setActiveQuizState(null);
    if (course && currentModuleIndexForQuiz !== null) {
      const nextModuleIndex = currentModuleIndexForQuiz + 1;
      if (course.modules[nextModuleIndex]?.lessons[0]) {
        setSelectedLesson(course.modules[nextModuleIndex].lessons[0]);
      }
    }
  }, [course, currentModuleIndexForQuiz]);

  const handleGoBackToLessons = useCallback(() => {
    setActiveQuiz(null);
    setQuizResults(null);
    setActiveQuizState(null);
    if (course && currentModuleIndexForQuiz !== null) {
        const currentModule = course.modules[currentModuleIndexForQuiz];
        if (currentModule && currentModule.lessons.length > 0) {
            // Select the first lesson of the module to allow review from the start
            const firstLesson = currentModule.lessons[0];
            setSelectedLesson(firstLesson);
        }
    }
  }, [course, currentModuleIndexForQuiz]);
  
  const handleContinueLearning = useCallback(() => {
    if (course) {
        const modules = Array.from(unlockedModules);
        const lastUnlockedModuleIndex = modules.length > 0 ? Math.max(...modules) : 0;
        const moduleToStart = course.modules[lastUnlockedModuleIndex];

        if (moduleToStart && moduleToStart.lessons.length > 0) {
            setSelectedLesson(moduleToStart.lessons[0]);
        }
        setShowContinuePrompt(false);
    }
  }, [course, unlockedModules]);

  const handleStartNew = useCallback(() => {
    resetState(true);
  }, []);

  const handleRetakeQuiz = useCallback(() => {
    if (!activeQuiz) return;
    setQuizResults(null);
    // Reset the quiz state for a fresh attempt
    setActiveQuizState({
        userAnswers: Array(activeQuiz.questions.length).fill(-1),
        currentQuestionIndex: 0,
        timeLeft: null, // Module quizzes are not timed
    });
  }, [activeQuiz]);

  const handleImportCourse = useCallback(async (importedCourseData: Course) => {
    if (!userContext?.currentUser || userContext.currentUser.profile?.role !== 'admin') {
      setError("Permission denied.");
      return;
    }
    
    if (!importedCourseData || !importedCourseData.title || !Array.isArray(importedCourseData.modules)) {
        setError("Invalid course data. Import failed.");
        return;
    }
    
    const newCourse = await storage.importCourseToDb(importedCourseData);

    if (!newCourse) {
      setError("Failed to save the imported course to the database.");
      return;
    }

    resetState(true);
    setCourse(newCourse);
    
    const skillMatch = newCourse.title.match(/\((Beginner|Intermediate|Advanced)\)/);
    const skillLevel = skillMatch ? skillMatch[1] as SkillLevel : 'Beginner';
    setUserSkillLevel(skillLevel);
    
    if (newCourse.modules.length > 0 && newCourse.modules[0].lessons.length > 0) {
        setSelectedLesson(newCourse.modules[0].lessons[0]);
    }
    
    setShowAdminDashboard(false);
  }, [userContext?.currentUser]);

  const handleToggleAdminView = () => {
    if (!showAdminDashboard) {
        setShowLeaderboard(false);
        setIsTutorOpen(false);
    }
    setShowAdminDashboard(prev => !prev);
  }

  const showTutorButton = course && selectedLesson && lessonContent && !isLoadingLesson && !activeQuiz && !quizResults && !isGeneratingQuiz;

  const renderContent = () => {
    if (userContext?.configError) {
        return <ConfigurationErrorScreen message={userContext.configError} />;
    }

    if (isAppLoading || userContext?.isLoading) {
        return <div className="flex justify-center items-center h-96"><Spinner className="w-16 h-16" /></div>;
    }

    if (!userContext?.currentUser) {
        return <Login />;
    }
    
    if (isAdmin && showAdminDashboard) {
      return <AdminDashboard 
        onClose={handleToggleAdminView}
        activeCourse={course}
        onImportCourse={handleImportCourse}
      />;
    }
    
    if (showContinuePrompt && course) {
        return <ContinueCourse course={course} onContinue={handleContinueLearning} onStartNew={handleStartNew} unlockedModules={unlockedModules} />;
    }
    
    if (showAssessmentPrompt && topicForCourseGeneration) {
        return <AssessmentPrompt 
            topic={topicForCourseGeneration}
            onStart={handleStartAssessment}
            onSkip={handleSkipAssessment}
            onClose={() => setShowAssessmentPrompt(false)}
        />
    }
    
    if (isGeneratingAssessment) {
        return <div className="flex flex-col items-center justify-center bg-gray-800/50 border border-gray-700 rounded-lg p-8 h-96"><Spinner className="w-12 h-12" /><p className="mt-4 text-lg text-gray-300">Generating your assessment...</p></div>;
    }

    if (isEvaluatingAssessment) {
        return <div className="flex flex-col items-center justify-center bg-gray-800/50 border border-gray-700 rounded-lg p-8 h-96"><Spinner className="w-12 h-12" /><p className="mt-4 text-lg text-gray-300">Evaluating your skill level...</p></div>;
    }

    if (assessmentResultToShow && topicForCourseGeneration) {
        return <AssessmentResultModal 
            score={assessmentResultToShow.score}
            skillLevel={assessmentResultToShow.skillLevel}
            topic={topicForCourseGeneration}
            onStartCourse={() => {
                setAssessmentResultToShow(null);
                startCourseGeneration(topicForCourseGeneration, assessmentResultToShow.skillLevel);
            }}
        />
    }

    if (activeAssessment) { // This is the skill assessment quiz
        return <QuizView 
            quiz={activeAssessment} 
            onSubmit={handleAssessmentSubmit} 
            onSurrender={handleAssessmentSurrender} 
            quizState={activeQuizState}
            onQuizStateChange={setActiveQuizState}
        />;
    }

    if (isLoadingCurriculum) {
      return <CourseDisplay isLoadingCurriculum={true} course={null} selectedLesson={null} lessonContent="" isLoadingLesson={false} error={null} onSelectLesson={() => {}} unlockedModules={unlockedModules} completedLessons={completedLessons} isGeneratingQuiz={false} onStartQuiz={()=>{}} shouldShowStartQuiz={false} />;
    }
    if (isGeneratingQuiz) {
      return <div className="flex flex-col items-center justify-center bg-gray-800/50 border border-gray-700 rounded-lg p-8 h-96"><Spinner className="w-12 h-12" /><p className="mt-4 text-lg text-gray-300">Generating your quiz...</p></div>;
    }
    if (activeQuiz && !quizResults) {
        return <QuizView 
            quiz={activeQuiz} 
            onSubmit={handleQuizSubmit} 
            quizState={activeQuizState}
            onQuizStateChange={setActiveQuizState}
        />;
    }
    if (activeQuiz && quizResults) {
      return <QuizResult 
        quiz={activeQuiz} 
        results={quizResults} 
        onRetake={handleRetakeQuiz} 
        onContinue={handleContinue}
        onGoBack={handleGoBackToLessons}
        courseTitle={course!.title}
      />;
    }
    if (course) {
      return <CourseDisplay course={course} selectedLesson={selectedLesson} lessonContent={lessonContent} isLoadingCurriculum={isLoadingCurriculum} isLoadingLesson={isLoadingLesson} error={error} onSelectLesson={handleSelectLesson} unlockedModules={unlockedModules} completedLessons={completedLessons} onStartQuiz={handleStartQuiz} shouldShowStartQuiz={shouldShowStartQuiz} isGeneratingQuiz={isGeneratingQuiz} />;
    }
    return <Hero onGenerate={handleGenerateCourseRequest} />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <Header 
        onShowLeaderboard={() => setShowLeaderboard(true)} 
        isCourseActive={!!course} 
        isAdmin={isAdmin}
        onToggleAdminView={handleToggleAdminView}
        onGoHome={handleGoHome}
      />
      <main className="container mx-auto px-4 py-8">
        {renderContent()}
      </main>
      {showLeaderboard && course && !showAdminDashboard && (
        <Leaderboard courseId={course.id!} courseTitle={course.title} onClose={() => setShowLeaderboard(false)} />
      )}
      {isTutorOpen && course && selectedLesson && lessonContent && !showAdminDashboard && (
        <AskTutor
          courseTitle={course.title}
          lessonTitle={selectedLesson.title}
          lessonContent={lessonContent}
          onClose={() => setIsTutorOpen(false)}
        />
      )}
      {showTutorButton && !showAdminDashboard && (
        <AskTutorButton onClick={() => setIsTutorOpen(true)} />
      )}
    </div>
  );
};

export default App;