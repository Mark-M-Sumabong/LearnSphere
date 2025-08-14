import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useCliSandbox } from '../hooks/useCliSandbox';
import { TerminalIcon } from './icons/TerminalIcon';
import { CommandHistoryEntry } from '../types';

export const CliSandbox: React.FC = () => {
  const { history, processCommand, currentPath } = useCliSandbox();
  const [input, setInput] = useState('');
  const [commandHistoryNav, setCommandHistoryNav] = useState(history.length);

  const terminalBodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (terminalBodyRef.current) {
      terminalBodyRef.current.scrollTop = terminalBodyRef.current.scrollHeight;
    }
  }, [history]);

  useEffect(() => {
    setCommandHistoryNav(history.length);
  }, [history]);
  
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() === 'clear') {
        processCommand('clear');
    } else if (input.trim()) {
        processCommand(input.trim());
    }
    setInput('');
    setCommandHistoryNav(history.length + 1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const userCommands = history.filter(h => h.command);
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const newIndex = Math.max(0, commandHistoryNav - 1);
      if (userCommands[newIndex]) {
        setInput(userCommands[newIndex].command);
        setCommandHistoryNav(newIndex);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const newIndex = Math.min(userCommands.length, commandHistoryNav + 1);
      if (newIndex < userCommands.length) {
        setInput(userCommands[newIndex].command);
      } else {
        setInput('');
      }
      setCommandHistoryNav(newIndex);
    }
  }

  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    focusInput();
  }, [focusInput]);

  const renderOutput = (output: any): React.ReactNode => {
    if (!output) {
      return null;
    }
 
    if (typeof output === 'object' && output._type === 'ls') {
      return (
        <ul className="list-none">
          {output.items.map((item: { name: string; type: string }) => (
            <li key={item.name} className={item.type === 'directory' ? 'text-blue-400' : 'text-gray-300'}>
              {item.name}
            </li>
          ))}
        </ul>
      );
    }
 
    if (typeof output === 'object' && output._type === 'cat') {
      return <pre className="whitespace-pre-wrap">{output.content}</pre>;
    }
 
    if (typeof output === 'string' && output.includes('\n')) {
      return <pre className="whitespace-pre-wrap">{output}</pre>;
    }
 
    return output;
  }

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg my-6 overflow-hidden font-mono text-sm shadow-lg" onClick={focusInput}>
      <div className="flex items-center gap-2 px-4 py-2 bg-gray-800 border-b border-gray-700">
        <TerminalIcon className="w-5 h-5 text-green-400" />
        <h4 className="font-semibold text-gray-300">Interactive Sandbox</h4>
      </div>

      <div ref={terminalBodyRef} className="p-4 h-72 overflow-y-auto">
        <p className="text-gray-400 mb-4">Welcome! Type 'help' for a list of commands.</p>
        
        {history.map((entry: CommandHistoryEntry, index: number) => (
          <div key={index} className="mb-2">
            <div className="flex gap-2 items-center">
              <span className="text-cyan-400">user@learnsphere:</span>
              <span className="text-purple-400">{entry.path}</span>
              <span className="text-gray-300">$</span>
              <span className="text-gray-100 break-all">{entry.command}</span>
            </div>
            {entry.output && <div className="text-gray-300 pl-1 leading-relaxed break-words">{renderOutput(entry.output)}</div>}
          </div>
        ))}

        <form onSubmit={handleFormSubmit} className="flex gap-2 items-center">
          <label htmlFor="cli-input" className="flex-shrink-0 flex gap-2 items-center">
            <span className="text-cyan-400">user@learnsphere:</span>
            <span className="text-purple-400">{currentPath}</span>
            <span className="text-gray-300">$</span>
          </label>
          <input
            ref={inputRef}
            id="cli-input"
            type="text"
            className="bg-transparent border-none text-gray-100 w-full focus:outline-none p-0"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck="false"
          />
        </form>
      </div>
    </div>
  );
};
