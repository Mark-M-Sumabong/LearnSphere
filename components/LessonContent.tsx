import React from 'react';
import { CliSandbox } from './CliSandbox';
import { ArrowRightIcon } from './icons/ArrowRightIcon';
import { Spinner } from './ui/Spinner';

interface LessonContentProps {
  content: string;
  showStartQuizButton: boolean;
  onStartQuiz: () => void;
  isGeneratingQuiz: boolean;
}

const CodeBlock: React.FC<{ language: string; code: string }> = ({ language, code }) => {
  return (
    <div className="bg-gray-900 rounded-md my-4">
      <div className="text-xs text-gray-400 px-4 py-2 border-b border-gray-700">{language || 'code'}</div>
      <pre className="p-4 text-sm text-gray-200 overflow-x-auto">
        <code>{code}</code>
      </pre>
    </div>
  );
};

export const LessonContent: React.FC<LessonContentProps> = ({ content, showStartQuizButton, onStartQuiz, isGeneratingQuiz }) => {
  const renderContent = () => {
    // Regex to split by code blocks, keeping the delimiter
    const codeBlockRegex = /(```[\s\S]*?```)/g;
    const parts = content.split(codeBlockRegex);

    return parts.map((part, index) => {
      if (codeBlockRegex.test(part)) {
        const codeMatch = part.match(/```(\S*)\n([\s\S]*?)```/);
        if (codeMatch) {
          const [, language, code] = codeMatch;
          const isInteractive = language === 'bash-interactive';
          
          return (
            <React.Fragment key={index}>
              <CodeBlock language={isInteractive ? 'bash' : language} code={code.trim()} />
              {isInteractive && <CliSandbox key={`sandbox-${index}`} />}
            </React.Fragment>
          );
        }
        return null;
      }

      // Process regular text content
      return part.split('\n').map((line, lineIndex) => {
        if (line.startsWith('### ')) {
          return <h3 key={`${index}-${lineIndex}`} className="text-2xl font-bold mt-6 mb-3 text-indigo-300">{line.substring(4)}</h3>;
        }
        if (line.startsWith('* ')) {
          return <li key={`${index}-${lineIndex}`} className="ml-6 my-1 text-gray-300">{line.substring(2)}</li>;
        }
        // Handle bold text with **text**
        const boldedLine = line.split('**').map((textPart, i) =>
          i % 2 === 1 ? <strong key={i}>{textPart}</strong> : textPart
        );

        return <p key={`${index}-${lineIndex}`} className="my-3 leading-relaxed text-gray-300">{boldedLine}</p>;
      });
    });
  };

  return (
    <article className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 md:p-8">
      {renderContent()}
      {showStartQuizButton && (
        <div className="mt-8 pt-6 border-t border-gray-700 text-center">
            <h3 className="text-xl font-bold text-white">Ready to test your knowledge?</h3>
            <p className="text-gray-400 mt-2 mb-4">You've completed the last lesson of this module. Take the quiz to unlock the next module.</p>
            <button
                onClick={onStartQuiz}
                disabled={isGeneratingQuiz}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed transition duration-200"
            >
                {isGeneratingQuiz ? <><Spinner className="w-5 h-5" /> Generating Quiz...</> : <>Start Quiz <ArrowRightIcon className="w-5 h-5" /></>}
            </button>
        </div>
      )}
    </article>
  );
};
