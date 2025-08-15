

import React, { useState } from 'react';
import { Quiz, QuizResults } from '../types';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import { ArrowRightIcon } from './icons/ArrowRightIcon';
import { generateStudyLink } from '../services/geminiService';
import { Spinner } from './ui/Spinner';
import { LinkIcon } from './icons/LinkIcon';
import { ExternalLinkIcon } from './icons/ExternalLinkIcon';
import { AlertTriangleIcon } from './icons/AlertTriangleIcon';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';

interface QuizResultProps {
  quiz: Quiz;
  results: QuizResults;
  onRetake: () => void;
  onContinue: () => void;
  onGoBack: () => void;
  courseTitle: string;
}

export const QuizResult: React.FC<QuizResultProps> = ({ quiz, results, onRetake, onContinue, onGoBack, courseTitle }) => {
  const scoreColor = results.isPassed ? 'text-green-400' : 'text-red-400';
  
  const [studyLink, setStudyLink] = useState<string | null>(null);
  const [isFetchingLink, setIsFetchingLink] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const handleGetStudyLink = async () => {
    setIsFetchingLink(true);
    setFetchError(null);
    setStudyLink(null);
    try {
      const link = await generateStudyLink(courseTitle, quiz.title);
      setStudyLink(link);
    } catch (e) {
      console.error("Failed to generate study link:", e);
      setFetchError("Sorry, we couldn't find a study link right now. Please try again.");
    } finally {
      setIsFetchingLink(false);
    }
  };


  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 md:p-8">
      <div className="text-center border-b border-gray-700 pb-6 mb-6">
        <h2 className="text-3xl font-bold text-white">Quiz Results</h2>
        <p className={`text-5xl font-extrabold my-3 ${scoreColor}`}>
          {Math.round(results.score * 100)}%
        </p>
        <p className="text-lg text-gray-300">
          You answered {results.correctAnswers} out of {results.totalQuestions} questions correctly.
        </p>
        {results.isPassed ? (
          <p className="mt-2 text-green-300">Congratulations! You've passed and unlocked the next module.</p>
        ) : (
          <p className="mt-2 text-red-300">You did not pass this time. Review the answers below and try again.</p>
        )}
      </div>

      <div className="space-y-6 mb-8">
        {quiz.questions.map((question, index) => {
          const userAnswer = results.userAnswers[index];
          const isCorrect = question.correctAnswerIndex === userAnswer;
          
          return (
            <div key={index} className="bg-gray-800 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                {isCorrect ? <CheckCircleIcon className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" /> : <XCircleIcon className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />}
                <p className="text-gray-100 font-medium flex-1">{question.questionText}</p>
              </div>
              <div className="mt-3 pl-9">
                {!isCorrect && userAnswer !== -1 && (
                    <p className="text-sm text-red-300 mb-2">Your answer: {question.options[userAnswer]}</p>
                )}
                 <p className="text-sm text-green-300 mb-2">Correct answer: {question.options[question.correctAnswerIndex]}</p>
                 <p className="text-sm text-gray-400"><strong className="text-gray-300">Explanation:</strong> {question.explanation}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <button
          onClick={onGoBack}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 border border-gray-600 text-base font-medium rounded-md text-gray-300 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-gray-500 transition duration-200"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Back to Module
        </button>
        {!results.isPassed ? (
          <button
            onClick={onRetake}
            className="w-full sm:w-auto flex items-center justify-center px-6 py-3 border border-indigo-500 text-base font-medium rounded-md text-indigo-300 hover:bg-indigo-900/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 transition duration-200"
          >
            Retake Quiz
          </button>
        ) : (
          <button
            onClick={onContinue}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 transition duration-200"
          >
            Continue to Next Module
            <ArrowRightIcon className="w-5 h-5" />
          </button>
        )}
      </div>

      {!results.isPassed && (
        <div className="mt-8 pt-8 border-t border-gray-700 text-center animate-fade-in">
            <h3 className="text-xl font-semibold text-white">Need some help?</h3>
            <p className="text-gray-400 mt-1 mb-4 max-w-xl mx-auto">Get a link to external study material to review the concepts from this module.</p>
            
            {!studyLink && !isFetchingLink && !fetchError && (
              <button
                onClick={handleGetStudyLink}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500 transition duration-200"
              >
                  <LinkIcon className="w-5 h-5"/>
                  Find Study Material
              </button>
            )}

            {isFetchingLink && (
              <div className="flex items-center justify-center gap-3 text-gray-400 p-3">
                <Spinner className="w-6 h-6" />
                <span>Searching for the best resources...</span>
              </div>
            )}

            {studyLink && (
              <div className="animate-fade-in text-center">
                <p className="text-gray-300 mb-3">Here is a resource that might help:</p>
                <a 
                    href={studyLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center max-w-full gap-2 px-4 py-2 text-base font-semibold rounded-md text-blue-300 bg-gray-900/50 hover:bg-gray-900 border border-gray-600 hover:text-blue-200 transition-colors"
                >
                    <ExternalLinkIcon className="w-5 h-5 flex-shrink-0" />
                    <span className="truncate">{studyLink}</span>
                </a>
              </div>
            )}
            
            {fetchError && (
                 <div className="mt-4 bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-md flex items-center gap-3 text-sm animate-fade-in max-w-lg mx-auto">
                    <AlertTriangleIcon className="w-5 h-5 flex-shrink-0" />
                    <p className="flex-1 text-left">{fetchError}</p>
                    <button onClick={handleGetStudyLink} className="font-bold hover:underline flex-shrink-0">Retry</button>
                </div>
            )}
        </div>
      )}
    </div>
  );
};