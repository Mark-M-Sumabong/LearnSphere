
import React from 'react';
import { ServerOffIcon } from './icons/ServerOffIcon';

interface ConfigurationErrorScreenProps {
  message: string;
}

export const ConfigurationErrorScreen: React.FC<ConfigurationErrorScreenProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white -mt-20 px-4">
      <div className="w-full max-w-2xl p-8 text-center bg-gray-800/50 border border-red-700/50 rounded-lg shadow-2xl">
        <ServerOffIcon className="w-20 h-20 text-red-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-red-400">Application Configuration Error</h1>
        <p className="mt-4 text-lg text-gray-300">
          The application cannot start because it's missing essential configuration.
        </p>
        <div className="mt-6 text-left bg-gray-900 p-4 rounded-md border border-gray-700">
          <p className="font-mono text-red-300 break-words">{message}</p>
        </div>
        <p className="mt-6 text-sm text-gray-400">
          If you are the developer, please ensure that `SUPABASE_URL` and `SUPABASE_ANON_KEY` are correctly set as environment variables in your deployment environment.
        </p>
      </div>
    </div>
  );
};
