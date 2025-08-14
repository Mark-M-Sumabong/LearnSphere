import React from 'react';
import { Course, Lesson } from '../types';
import { CurriculumSidebar } from './CurriculumSidebar';
import { LessonContent } from './LessonContent';
import { CurriculumSkeleton } from './skeletons/CurriculumSkeleton';
import { LessonSkeleton } from './skeletons/LessonSkeleton';
import { AlertTriangleIcon } from './icons/AlertTriangleIcon';
import { Spinner } from './ui/Spinner';

interface CourseDisplayProps {
  course: Course | null;
  selectedLesson: Lesson | null;
  lessonContent: string;
  isLoadingCurriculum: boolean;
  isLoadingLesson: boolean;
  error: string | null;
  onSelectLesson: (lesson: Lesson) => void;
  unlockedModules: Set<number>;
  shouldShowStartQuiz: boolean;
  onStartQuiz: () => void;
  isGeneratingQuiz: boolean;
}

export const CourseDisplay: React.FC<CourseDisplayProps> = ({
  course,
  selectedLesson,
  lessonContent,
  isLoadingCurriculum,
  isLoadingLesson,
  error,
  onSelectLesson,
  unlockedModules,
  shouldShowStartQuiz,
  onStartQuiz,
  isGeneratingQuiz
}) => {
  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <aside className="w-full lg:w-1/3 lg:max-w-sm flex-shrink-0">
        {isLoadingCurriculum ? (
          <CurriculumSkeleton />
        ) : course ? (
          <CurriculumSidebar
            course={course}
            selectedLesson={selectedLesson}
            onSelectLesson={onSelectLesson}
            isGeneratingLesson={isLoadingLesson}
            unlockedModules={unlockedModules}
          />
        ) : null}
      </aside>

      <div className="flex-1 min-w-0">
        {error && !isLoadingLesson && !isGeneratingQuiz && (
          <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-md flex items-center gap-3">
            <AlertTriangleIcon className="w-6 h-6" />
            <p>{error}</p>
          </div>
        )}
        {isLoadingLesson ? (
          <LessonSkeleton />
        ) : lessonContent ? (
          <LessonContent
             content={lessonContent}
             showStartQuizButton={shouldShowStartQuiz}
             onStartQuiz={onStartQuiz}
             isGeneratingQuiz={isGeneratingQuiz}
           />
        ) : !error && !isGeneratingQuiz ? (
          <div className="flex items-center justify-center h-full min-h-[300px] bg-gray-800/50 rounded-lg">
            <p className="text-gray-400">Select a lesson to view its content.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
};
