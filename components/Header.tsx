
import React, { useContext } from 'react';
import { BrainCircuitIcon } from './icons/BrainCircuitIcon';
import { TrophyIcon } from './icons/TrophyIcon';
import { UserContext } from '../contexts/UserContext';
import { ShieldIcon } from './icons/ShieldIcon';
import { HomeIcon } from './icons/HomeIcon';

interface HeaderProps {
  onShowLeaderboard: () => void;
  isCourseActive: boolean;
  isAdmin: boolean;
  onToggleAdminView: () => void;
  onGoHome: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onShowLeaderboard, isCourseActive, isAdmin, onToggleAdminView, onGoHome }) => {
  const userContext = useContext(UserContext);

  if (!userContext) {
    return null; // Or some fallback
  }
  const { currentUser, logout } = userContext;

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  }

  return (
    <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <BrainCircuitIcon className="w-8 h-8 text-indigo-400" />
          <h1 className="text-2xl font-bold tracking-tight text-white">LearnSphere AI</h1>
        </div>
        {currentUser && (
          <div className="flex items-center gap-2 sm:gap-4">
            {isCourseActive && (
              <button
                onClick={onGoHome}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                title="Go to Home"
              >
                <HomeIcon className="w-5 h-5" />
                <span className="hidden sm:inline">Home</span>
              </button>
            )}
            {isAdmin && (
              <button
                onClick={onToggleAdminView}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                title="Admin Dashboard"
              >
                <ShieldIcon className="w-5 h-5 text-green-400" />
                <span className="hidden sm:inline">Admin</span>
              </button>
            )}
            {isCourseActive && (
              <button
                onClick={onShowLeaderboard}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                title="View Leaderboard"
              >
                <TrophyIcon className="w-5 h-5 text-yellow-400" />
                <span className="hidden sm:inline">Leaderboard</span>
              </button>
            )}
            <span className="text-gray-300 font-medium hidden md:block">
              Welcome, {currentUser.profile?.username || currentUser.email}
            </span>
            <button
              onClick={handleLogout}
              className="px-3 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
