import React, { useState, useCallback, useEffect } from 'react';
import { Quiz, ActiveQuizState } from '../types';
import { ArrowRightIcon } from './icons/ArrowRightIcon';
import { LightbulbIcon } from './icons/LightbulbIcon';
import { Spinner } from './ui/Spinner';
import { generateHint } from '../services/geminiService';
import { ClockIcon } from './icons/ClockIcon';
import { FlagIcon } from './icons/FlagIcon';

interface QuizViewProps {
  quiz: Quiz;
  onSubmit: (answers: number[]) => void;
  onSurrender?: () => void;
  quizState: ActiveQuizState | null;
  onQuizStateChange: (state: ActiveQuizState | null) => void;
}

const ASSESSMENT_DURATION_SECONDS = 20 * 60; // 20 minutes

export const QuizView: React.FC<QuizViewProps> = ({ quiz, onSubmit, onSurrender, quizState, onQuizStateChange }) => {
  const [hint, setHint] = useState<string | null>(null);
  const [isHintLoading, setIsHintLoading] = useState<boolean>(false);
  const [revealedHints, setRevealedHints] = useState(new Set<number>());

  const isAssessment = quiz.title.startsWith('Skill Assessment:');

  useEffect(() => {
    // If there's no quiz state, initialize it.
    // This happens when a quiz is first started.
    if (!quizState) {
      onQuizStateChange({
        userAnswers: Array(quiz.questions.length).fill(-1),
        currentQuestionIndex: 0,
        timeLeft: isAssessment ? ASSESSMENT_DURATION_SECONDS : null,
      });
    }
  }, [quiz, quizState, onQuizStateChange, isAssessment]);
  
  // Timer countdown effect for assessments
  useEffect(() => {
    if (!isAssessment || !quizState || quizState.timeLeft === null) return;

    if (quizState.timeLeft <= 0) {
      onSubmit(quizState.userAnswers);
      return;
    }

    const timerId = setInterval(() => {
      onQuizStateChange({ ...quizState, timeLeft: quizState.timeLeft! - 1 });
    }, 1000);

    return () => clearInterval(timerId);
  }, [isAssessment, quizState, onQuizStateChange, onSubmit]);

  if (!quizState) {
    // Render a spinner while the initial state is being set
    return <div className="flex justify-center items-center h-96"><Spinner className="w-12 h-12" /></div>;
  }

  const { userAnswers, currentQuestionIndex, timeLeft } = quizState;

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (optionIndex: number) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = optionIndex;
    onQuizStateChange({ ...quizState, userAnswers: newAnswers });
  };
  
  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      onQuizStateChange({ ...quizState, currentQuestionIndex: currentQuestionIndex + 1 });
      setHint(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(userAnswers);
  };

  const handleSurrender = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    onSurrender?.();
  }
  
  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;

  const handleGetHint = useCallback(async () => {
    if (!currentQuestion) return;

    setIsHintLoading(true);
    setHint(null);
    try {
      const generatedHint = await generateHint(quiz.title, currentQuestion.questionText, currentQuestion.options);
      setHint(generatedHint);
      setRevealedHints(prev => new Set(prev).add(currentQuestionIndex));
    } catch (error) {
      console.error("Failed to get hint:", error);
      setHint("Sorry, I couldn't generate a hint right now. Please try again.");
    } finally {
      setIsHintLoading(false);
    }
  }, [currentQuestion, currentQuestionIndex, quiz.title]);

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 md:p-8">
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-2 gap-2">
            <h2 className="text-2xl font-bold text-indigo-300">{quiz.title}</h2>
            <div className="flex items-center gap-4">
                {isAssessment && timeLeft !== null && (
                  <div className={`flex items-center gap-2 text-lg font-semibold`} title={`Time remaining: ${formatTime(timeLeft)}`}>
                    <ClockIcon className={`w-6 h-6 ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-red-400'}`} />
                    <span className={timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-red-400'}>{formatTime(timeLeft)}</span>
                  </div>
                )}
                <p className="text-gray-400 font-medium bg-gray-700/50 px-3 py-1 rounded-md">{`Question ${currentQuestionIndex + 1} of ${quiz.questions.length}`}</p>
            </div>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2.5">
          <div className="bg-indigo-500 h-2.5 rounded-full" style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}></div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <p className="text-lg text-gray-100 mb-4">{currentQuestion.questionText}</p>
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <label
                key={index}
                className={`block w-full text-left p-4 rounded-md border-2 transition-all cursor-pointer ${
                  userAnswers[currentQuestionIndex] === index
                    ? 'bg-indigo-900/50 border-indigo-500'
                    : 'bg-gray-800 border-gray-600 hover:border-indigo-600'
                }`}
              >
                <input
                  type="radio"
                  name={`question-${currentQuestionIndex}`}
                  value={index}
                  checked={userAnswers[currentQuestionIndex] === index}
                  onChange={() => handleSelectOption(index)}
                  className="sr-only"
                />
                <span className="font-medium text-gray-200">{option}</span>
              </label>
            ))}
          </div>
        </div>
        
        {/* Actions and Hint bar */}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center mt-6 mb-2 min-h-[4rem]">
          {isAssessment ? (
             <button
                type="button"
                onClick={handleSurrender}
                className="mt-4 sm:mt-0 flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md text-gray-300 bg-gray-700 hover:bg-red-900/80 hover:text-white border border-gray-600 hover:border-red-700 transition-colors"
                title="End the assessment and start a beginner course"
              >
                <FlagIcon className="w-4 h-4" />
                Surrender Assessment
            </button>
          ) : (
            <div className="mt-4 sm:mt-0">
              {hint && (
                  <div className="bg-gray-900/70 border border-gray-700 rounded-lg p-3 animate-fade-in max-w-lg">
                      <p className="flex items-start gap-2 text-sm">
                          <LightbulbIcon className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-300"><strong className="font-semibold text-yellow-300">Hint:</strong> {hint}</span>
                      </p>
                  </div>
              )}
              {!hint && !revealedHints.has(currentQuestionIndex) && (
                <button
                  type="button"
                  onClick={handleGetHint}
                  disabled={isHintLoading}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md text-yellow-300 bg-yellow-900/50 border border-yellow-700/50 hover:bg-yellow-900/80 disabled:opacity-50 disabled:cursor-wait transition-colors"
                >
                  {isHintLoading ? (
                    <>
                      <Spinner className="w-4 h-4" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <LightbulbIcon className="w-4 h-4" />
                      Get a Hint
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        
          <div className="flex justify-end">
              {isLastQuestion ? (
                   <button
                      type="submit"
                      disabled={userAnswers[currentQuestionIndex] === -1}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-green-500 disabled:bg-green-400 disabled:cursor-not-allowed transition duration-200"
                  >
                      Submit Quiz
                  </button>
              ) : (
                  <button
                      type="button"
                      onClick={handleNext}
                      disabled={userAnswers[currentQuestionIndex] === -1}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed transition duration-200"
                  >
                      Next Question
                      <ArrowRightIcon className="w-5 h-5" />
                  </button>
              )}
          </div>
        </div>
      </form>
    </div>
  );
};