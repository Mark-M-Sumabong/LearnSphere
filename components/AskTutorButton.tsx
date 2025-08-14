import React from 'react';
import { HelpCircleIcon } from './icons/HelpCircleIcon';

interface AskTutorButtonProps {
  onClick: () => void;
}

export const AskTutorButton: React.FC<AskTutorButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-40 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500"
      aria-label="Ask the AI Tutor"
      title="Ask the AI Tutor"
    >
      <HelpCircleIcon className="w-8 h-8" />
    </button>
  );
};
