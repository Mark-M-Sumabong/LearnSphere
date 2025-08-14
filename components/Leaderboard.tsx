
import React, { useState, useEffect } from 'react';
import { LeaderboardEntry } from '../types';
import * as storage from '../services/storageService';
import { TrophyIcon } from './icons/TrophyIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import { Spinner } from './ui/Spinner';

interface LeaderboardProps {
  courseId: number;
  courseTitle: string;
  onClose: () => void;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ courseId, courseTitle, onClose }) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      const data = await storage.getLeaderboard(courseId);
      setLeaderboard(data);
      setIsLoading(false);
    }
    fetchLeaderboard();
  }, [courseId]);

  const getRankColor = (rank: number) => {
    if (rank === 0) return 'text-yellow-400';
    if (rank === 1) return 'text-gray-300';
    if (rank === 2) return 'text-yellow-600';
    return 'text-gray-400';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl w-full max-w-2xl transform transition-all">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <div className="flex items-center gap-3">
                <TrophyIcon className="w-6 h-6 text-yellow-400" />
                <h2 className="text-xl font-bold text-white">Leaderboard: {courseTitle}</h2>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
                <XCircleIcon className="w-7 h-7" />
            </button>
        </div>
        
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {isLoading ? (
             <div className="flex justify-center items-center h-48"><Spinner className="w-12 h-12" /></div>
          ) : leaderboard.length > 0 ? (
            <ol className="space-y-3">
              {leaderboard.map((entry, index) => (
                <li key={entry.username} className="flex items-center justify-between bg-gray-900/50 p-3 rounded-md">
                    <div className="flex items-center gap-4">
                        <span className={`text-2xl font-bold w-8 text-center ${getRankColor(index)}`}>{index + 1}</span>
                        <span className="font-semibold text-white">{entry.username}</span>
                    </div>
                    <span className={`text-lg font-bold ${getRankColor(index)}`}>
                        {Math.round(entry.score * 100)}%
                    </span>
                </li>
              ))}
            </ol>
          ) : (
            <div className="text-center py-12">
                <TrophyIcon className="w-16 h-16 text-gray-600 mx-auto" />
                <h3 className="mt-2 text-lg font-medium text-white">No Scores Yet</h3>
                <p className="mt-1 text-sm text-gray-400">Be the first to complete a quiz and get on the board!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
