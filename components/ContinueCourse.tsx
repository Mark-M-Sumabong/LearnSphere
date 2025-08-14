
import React from 'react';
import { Course } from '../types';
import { BrainCircuitIcon } from './icons/BrainCircuitIcon';
import { ArrowRightIcon } from './icons/ArrowRightIcon';

interface ContinueCourseProps {
  course: Course;
  onContinue: () => void;
  unlockedModules: Set<number>;
  onStartNew: () => void;
}

export const ContinueCourse: React.FC<ContinueCourseProps> = ({ course, onContinue, unlockedModules, onStartNew }) => {
  const totalModules = course.modules.length;
  // Unlocked modules includes the one in progress, so subtract 1 for "completed"
  const completedModules = Math.max(0, unlockedModules.size - 1);
  const progress = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

  return (
    <div className="text-center py-16 sm:py-24 animate-fade-in">
      <BrainCircuitIcon className="w-16 h-16 text-indigo-400 mx-auto mb-4" />
      <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
        Welcome Back!
      </h2>
      <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-400">
        You're making great progress. Continue your course on:
      </p>
      <p className="mt-2 max-w-3xl mx-auto text-2xl font-bold text-indigo-300">
        {course.title}
      </p>
      
      <div className="mt-8 max-w-md mx-auto">
        <div className="flex justify-between mb-1">
            <span className="text-base font-medium text-indigo-300">Progress</span>
            <span className="text-sm font-medium text-indigo-300">{progress}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2.5">
            <div className="bg-indigo-600 h-2.5 rounded-full" style={{width: `${progress}%`}}></div>
        </div>
        <p className="text-gray-400 text-sm mt-2">{completedModules} of {totalModules} modules completed</p>
      </div>

      <div className="mt-10 flex flex-col items-center gap-4">
        <button
          onClick={onContinue}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 border border-transparent text-lg font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 transition duration-200"
        >
          Continue Learning
          <ArrowRightIcon className="w-6 h-6" />
        </button>
        <button
          onClick={onStartNew}
          className="text-base font-medium text-gray-400 hover:text-indigo-300 transition-colors"
        >
          Or, start a new course
        </button>
      </div>
    </div>
  );
};
