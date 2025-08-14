import React, { useState, useRef, useEffect } from 'react';
import { askTutor } from '../services/geminiService';
import { XCircleIcon } from './icons/XCircleIcon';
import { HelpCircleIcon } from './icons/HelpCircleIcon';
import { BrainCircuitIcon } from './icons/BrainCircuitIcon';
import { Spinner } from './ui/Spinner';
import { ArrowRightIcon } from './icons/ArrowRightIcon';

interface AskTutorProps {
  courseTitle: string;
  lessonTitle: string;
  lessonContent: string;
  onClose: () => void;
}

interface Message {
  sender: 'user' | 'ai';
  text: string;
}

const renderMessageContent = (text: string) => {
    // A simplified renderer for markdown-like syntax
    return text.split('\n').map((line, lineIndex) => {
        if (line.startsWith('* ')) {
          return <li key={lineIndex} className="ml-4 list-disc">{line.substring(2)}</li>;
        }
        const boldedLine = line.split('**').map((textPart, i) =>
          i % 2 === 1 ? <strong key={i}>{textPart}</strong> : textPart
        );
        return <p key={lineIndex} className="my-1">{boldedLine}</p>;
      });
}

export const AskTutor: React.FC<AskTutorProps> = ({ courseTitle, lessonTitle, lessonContent, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
      { sender: 'ai', text: `Hi! I'm your AI Tutor. Ask me anything about "${lessonTitle}" and I'll do my best to help you understand the material.` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const aiResponse = await askTutor(courseTitle, lessonTitle, lessonContent, input);
      setMessages(prev => [...prev, { sender: 'ai', text: aiResponse }]);
    } catch (error) {
      console.error("Error asking tutor:", error);
      setMessages(prev => [...prev, { sender: 'ai', text: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
      <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl w-full max-w-2xl h-[80vh] flex flex-col transform transition-all animate-fade-in">
        <header className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
          <div className="flex items-center gap-3">
            <HelpCircleIcon className="w-6 h-6 text-indigo-400" />
            <h2 className="text-xl font-bold text-white">AI Tutor</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <XCircleIcon className="w-7 h-7" />
          </button>
        </header>
        
        <main className="flex-1 p-6 overflow-y-auto space-y-6">
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
              {msg.sender === 'ai' && <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0"><BrainCircuitIcon className="w-5 h-5 text-white" /></div>}
              <div className={`max-w-lg p-3 rounded-lg ${msg.sender === 'ai' ? 'bg-gray-700 text-gray-200' : 'bg-blue-600 text-white'}`}>
                {renderMessageContent(msg.text)}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-3">
               <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0"><BrainCircuitIcon className="w-5 h-5 text-white" /></div>
               <div className="max-w-lg p-3 rounded-lg bg-gray-700 text-gray-200 flex items-center">
                    <Spinner className="w-5 h-5" />
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </main>

        <footer className="p-4 border-t border-gray-700 flex-shrink-0">
          <form onSubmit={handleSubmit} className="flex items-center gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about the lesson..."
              disabled={isLoading}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-2.5 rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed transition duration-200"
            >
              <ArrowRightIcon className="w-6 h-6" />
            </button>
          </form>
        </footer>
      </div>
    </div>
  );
};
