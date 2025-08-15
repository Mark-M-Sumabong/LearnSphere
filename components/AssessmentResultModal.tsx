
import React from 'react';
import { SkillLevel } from '../types';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { ArrowRightIcon } from './icons/ArrowRightIcon';

interface AssessmentResultModalProps {
  score: number;
  skillLevel: SkillLevel;
  topic: string;
  onStartCourse: () => void;
}

export const AssessmentResultModal: React.FC<AssessmentResultModalProps> = ({ score, skillLevel, topic, onStartCourse }) => {
  
    const getSkillLevelInfo = () => {
        switch (skillLevel) {
            case 'Beginner': 
                return { 
                    color: 'text-green-400', 
                    description: "We'll start with the fundamentals to build a strong foundation." 
                };
            case 'Intermediate': 
                return { 
                    color: 'text-yellow-400',
                    description: "We'll skip the basics and dive into the core concepts."
                };
            case 'Advanced': 
                return { 
                    color: 'text-red-400',
                    description: "Get ready for a deep dive into advanced topics and expert techniques."
                };
            default: 
                return { 
                    color: 'text-gray-400',
                    description: "We'll start with the fundamentals to build a strong foundation."
                };
        }
    };

    const skillInfo = getSkillLevelInfo();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl w-full max-w-lg transform transition-all text-center p-8">
        <CheckCircleIcon className="w-16 h-16 text-green-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white">Assessment Complete!</h2>
        
        <p className="mt-4 text-gray-300">
          Based on your answers for <strong className="text-indigo-300">{topic}</strong>, here's your result:
        </p>
        
        <div className="my-6 bg-gray-900/50 rounded-lg p-4">
            <p className="text-lg text-gray-400">Your Score</p>
            <p className="text-5xl font-extrabold text-white my-1">{Math.round(score * 100)}%</p>
            <p className="text-lg text-gray-400 mt-4">Your Personalized Skill Level</p>
            <p className={`text-3xl font-bold my-1 ${skillInfo.color}`}>{skillLevel}</p>
        </div>

        <p className="text-gray-400 mb-8">{skillInfo.description}</p>
        
        <div className="mt-8 flex justify-center">
          <button
            onClick={onStartCourse}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 transition duration-200"
          >
            Start Your Personalized Course
            <ArrowRightIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
