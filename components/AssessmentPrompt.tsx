import React from 'react';
import { ChecklistIcon } from './icons/ChecklistIcon';
import { XCircleIcon } from './icons/XCircleIcon';

interface AssessmentPromptProps {
  topic: string;
  onStart: () => void;
  onSkip: () => void;
  onClose: () => void;
}

export const AssessmentPrompt: React.FC<AssessmentPromptProps> = ({ topic, onStart, onSkip, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl w-full max-w-lg transform transition-all text-center p-8 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
            <XCircleIcon className="w-7 h-7" />
        </button>
        <ChecklistIcon className="w-16 h-16 text-indigo-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white">Assess Your Skills?</h2>
        <p className="mt-2 text-gray-300">
          To create the best learning path for you in <strong className="text-indigo-300">{topic}</strong>, we can start with a quick skill assessment.
        </p>
        <p className="mt-1 text-sm text-gray-400">
            Or, you can skip and start with a standard beginner's course.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={onStart}
            className="w-full sm:w-auto flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 transition duration-200"
          >
            Start Assessment
          </button>
          <button
            onClick={onSkip}
            className="w-full sm:w-auto flex items-center justify-center px-6 py-3 border border-gray-600 text-base font-medium rounded-md text-gray-300 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-gray-500 transition duration-200"
          >
            Skip & Start Course
          </button>
        </div>
      </div>
    </div>
  );
};