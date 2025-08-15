import React from 'react';
import { Course, Lesson, Module } from '../types';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { LockIcon } from './icons/LockIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { Spinner } from './ui/Spinner';

interface CurriculumSidebarProps {
  course: Course;
  selectedLesson: Lesson | null;
  onSelectLesson: (lesson: Lesson) => void;
  isGeneratingLesson: boolean;
  unlockedModules: Set<number>;
  completedLessons: Set<string>;
}

export const CurriculumSidebar: React.FC<CurriculumSidebarProps> = ({ course, selectedLesson, onSelectLesson, isGeneratingLesson, unlockedModules, completedLessons }) => {
  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 sticky top-24">
      <h2 className="text-3xl font-bold text-white">{course.title}</h2>
      <p className="mt-4 text-base text-gray-300">{course.description}</p>
      <div className="mt-8 space-y-4">
        {course.modules.map((module: Module, moduleIndex: number) => {
          const isUnlocked = unlockedModules.has(moduleIndex);
          const isModuleCompleted = unlockedModules.has(moduleIndex + 1);
          const cleanModuleTitle = module.title.replace(/^Module\s*\d+:\s*/i, '');

          return (
            <div key={moduleIndex} className={`${!isUnlocked ? 'opacity-50' : ''}`}>
              <h3 className="flex items-center text-lg font-semibold text-gray-200">
                {isUnlocked ? (
                  isModuleCompleted ? <CheckCircleIcon className="w-5 h-5 mr-2 text-green-400" /> : <ChevronDownIcon className="w-5 h-5 mr-2 text-gray-500" />
                ) : (
                  <LockIcon className="w-5 h-5 mr-2 text-gray-500" />
                )}
                {`Module ${moduleIndex + 1}: ${cleanModuleTitle}`}
              </h3>
              <ul className="mt-2 ml-4 space-y-1 border-l border-gray-600 pl-4">
                {module.lessons.map((lesson: Lesson, lessonIndex: number) => {
                  const isSelected = selectedLesson?.title === lesson.title;
                  const isLessonCompleted = completedLessons.has(lesson.title);
                  return (
                    <li key={lessonIndex}>
                      <button
                        onClick={() => onSelectLesson(lesson)}
                        disabled={!isUnlocked || (isGeneratingLesson && isSelected)}
                        className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-md transition-colors duration-200 ${
                          isSelected
                            ? 'bg-indigo-600 text-white'
                            : 'text-gray-300 hover:bg-gray-700'
                        } disabled:cursor-not-allowed disabled:hover:bg-transparent`}
                      >
                        {isGeneratingLesson && isSelected 
                            ? <Spinner className="w-4 h-4" /> 
                            : isLessonCompleted ? <CheckCircleIcon className="w-4 h-4 text-green-400 flex-shrink-0" /> : <BookOpenIcon className="w-4 h-4 flex-shrink-0" />}
                        <span className="flex-1">{lesson.title}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
};