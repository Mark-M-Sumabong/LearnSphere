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
}

export const CurriculumSidebar: React.FC<CurriculumSidebarProps> = ({ course, selectedLesson, onSelectLesson, isGeneratingLesson, unlockedModules }) => {
  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 sticky top-24">
      <h2 className="text-2xl font-bold text-white">{course.title}</h2>
      <p className="mt-2 text-sm text-gray-400">{course.description}</p>
      <div className="mt-6 space-y-4">
        {course.modules.map((module: Module, moduleIndex: number) => {
          const isUnlocked = unlockedModules.has(moduleIndex);
          const isCompleted = unlockedModules.has(moduleIndex + 1);

          return (
            <div key={moduleIndex} className={`${!isUnlocked ? 'opacity-50' : ''}`}>
              <h3 className="flex items-center text-lg font-semibold text-gray-200">
                {isUnlocked ? (
                  isCompleted ? <CheckCircleIcon className="w-5 h-5 mr-2 text-green-400" /> : <ChevronDownIcon className="w-5 h-5 mr-2 text-gray-500" />
                ) : (
                  <LockIcon className="w-5 h-5 mr-2 text-gray-500" />
                )}
                {`Module ${moduleIndex + 1}: ${module.title}`}
              </h3>
              <ul className="mt-2 ml-4 space-y-1 border-l border-gray-600 pl-4">
                {module.lessons.map((lesson: Lesson, lessonIndex: number) => {
                  const isSelected = selectedLesson?.title === lesson.title;
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
                        {isGeneratingLesson && isSelected ? <Spinner className="w-4 h-4" /> : <BookOpenIcon className="w-4 h-4 flex-shrink-0" />}
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
