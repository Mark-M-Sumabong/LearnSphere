
import React, { useState } from 'react';
import { ArrowRightIcon } from './icons/ArrowRightIcon';

interface HeroProps {
  onGenerate: (topic: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onGenerate }) => {
  const [topic, setTopic] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim()) {
      onGenerate(topic.trim());
    }
  };

  return (
    <div className="text-center py-16 sm:py-24">
      <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
        Your Personal AI-Powered Course Training Module
      </h2>
      <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-400">
        What do you want to learn today? Enter any topic, and our agent will build a custom course for you in seconds.
      </p>
      <form onSubmit={handleSubmit} className="mt-8 max-w-xl mx-auto flex flex-col sm:flex-row items-center gap-4">
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g., 'Quantum Computing' or 'Linux'"
          className="w-full px-5 py-3 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
        />
        <button
          type="submit"
          disabled={!topic.trim()}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed transition duration-200"
        >
          Generate Course
          <ArrowRightIcon className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};
