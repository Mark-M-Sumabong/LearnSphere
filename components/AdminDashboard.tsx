



import React, { useState, useEffect, useContext } from 'react';
import { AssessmentResult, LeaderboardEntry, Course, SkillLevel } from '../types';
import * as storage from '../services/storageService';
import { ArrowRightIcon } from './icons/ArrowRightIcon';
import { TrophyIcon } from './icons/TrophyIcon';
import { ChecklistIcon } from './icons/ChecklistIcon';
import { DiagramIcon } from './icons/DiagramIcon';
import { AgenticFlowDiagram } from './AgenticFlowDiagram';
import { DatabaseIcon } from './icons/DatabaseIcon';
import { DataManagementView } from './DataManagementView';
import { UserContext } from '../contexts/UserContext';
import { Spinner } from './ui/Spinner';
import { UsersIcon } from './icons/UsersIcon';
import { StudentAnalyticsView } from './StudentAnalyticsView';

interface AdminDashboardProps {
  onClose: () => void;
  activeCourse: Course | null;
  onImportCourse: (course: Course) => void;
}

type Tab = 'flow' | 'analytics' | 'assessments' | 'rankings' | 'data';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose, activeCourse, onImportCourse }) => {
  const userContext = useContext(UserContext);
  const [activeTab, setActiveTab] = useState<Tab>('flow');
  const [assessments, setAssessments] = useState<AssessmentResult[]>([]);
  const [rankings, setRankings] = useState<{ title: string; entries: LeaderboardEntry[] }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const isAdmin = userContext?.currentUser?.profile?.role === 'admin';
    if (!isAdmin) {
      setIsLoading(false);
      return;
    }
    
    const fetchAdminData = async () => {
        setIsLoading(true);
        try {
            if (activeTab === 'assessments') {
                const allAssessments = await storage.getAllAssessmentResults();
                setAssessments(allAssessments);
            } else if (activeTab === 'rankings') {
                const allCourses = await storage.getAllCoursesForAdmin();
                const allRankingsPromises = allCourses.map(course => storage.getLeaderboardForAdmin(course.id));
                const resolvedRankings = await Promise.all(allRankingsPromises);
                const validRankings = resolvedRankings.filter((r): r is { title: string; entries: LeaderboardEntry[] } => r !== null && r.entries.length > 0);
                setRankings(validRankings);
            }
        } catch (error) {
            console.error("Failed to fetch admin data:", error);
            // Optionally set an error state to show in the UI
        } finally {
            setIsLoading(false);
        }
    }
    
    fetchAdminData();
  }, [userContext, activeTab]);
  
  const getSkillLevelColor = (level: SkillLevel) => {
    switch (level) {
        case 'Beginner': return 'text-green-400 bg-green-900/50';
        case 'Intermediate': return 'text-yellow-400 bg-yellow-900/50';
        case 'Advanced': return 'text-red-400 bg-red-900/50';
        default: return 'text-gray-400 bg-gray-700/50';
    }
  }

  const getRankColor = (rank: number) => {
    if (rank === 0) return 'text-yellow-400';
    if (rank === 1) return 'text-gray-300';
    if (rank === 2) return 'text-yellow-600';
    return 'text-gray-400';
  };
  
  const renderContent = () => {
    if (isLoading) {
        return <div className="flex justify-center items-center h-96"><Spinner className="w-12 h-12" /></div>;
    }

    if (userContext?.currentUser?.profile?.role !== 'admin') {
        return <p className="text-red-400 text-center py-8">Permission Denied. You are not an administrator.</p>
    }

    switch(activeTab) {
        case 'flow':
            return <AgenticFlowDiagram />;
        case 'analytics':
            return <StudentAnalyticsView />;
        case 'assessments':
            return (
                <div>
                    {assessments.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-700">
                        <thead className="bg-gray-800">
                            <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">User</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Topic</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Score</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Skill Level</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                            </tr>
                        </thead>
                        <tbody className="bg-gray-900/50 divide-y divide-gray-700">
                            {assessments.map((result, index) => (
                            <tr key={index}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{result.username}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{result.topic}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{Math.round(result.score * 100)}%</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getSkillLevelColor(result.skillLevel)}`}>
                                        {result.skillLevel}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{new Date(result.timestamp).toLocaleString()}</td>
                            </tr>
                            ))}
                        </tbody>
                        </table>
                    </div>
                    ) : (
                    <p className="text-gray-400 text-center py-8">No assessment results recorded yet.</p>
                    )}
                </div>
            );
        case 'rankings':
            return (
                <div>
                    {rankings.length > 0 ? (
                        <div className="space-y-6">
                        {rankings.map(ranking => (
                            <details key={ranking.title} className="bg-gray-900/50 p-4 rounded-lg" open>
                                <summary className="text-lg font-bold text-indigo-300 cursor-pointer">{ranking.title}</summary>
                                <ol className="space-y-3 mt-4">
                                {ranking.entries.map((entry, index) => (
                                    <li key={entry.username} className="flex items-center justify-between bg-gray-800 p-3 rounded-md">
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
                            </details>
                        ))}
                        </div>
                    ) : (
                        <p className="text-gray-400 text-center py-8">No leaderboards have been generated yet.</p>
                    )}
                </div>
            );
        case 'data':
            return <DataManagementView activeCourse={activeCourse} onImportCourse={onImportCourse} />;
    }
  }

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 md:p-8 animate-fade-in">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-gray-700 pb-4 mb-6">
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <button
                onClick={onClose}
                className="mt-4 sm:mt-0 flex items-center justify-center gap-2 px-4 py-2 border border-gray-600 text-base font-medium rounded-md text-gray-300 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-gray-500 transition duration-200"
            >
                Back to App <ArrowRightIcon className="w-5 h-5" />
            </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-600 mb-6 overflow-x-auto">
            <button
                onClick={() => setActiveTab('flow')}
                className={`flex-shrink-0 px-4 py-2 text-lg font-semibold transition-colors flex items-center gap-2 ${activeTab === 'flow' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-400 hover:text-white'}`}
            >
                <DiagramIcon className="w-5 h-5"/>
                Agentic Flow
            </button>
            <button
                onClick={() => setActiveTab('analytics')}
                className={`flex-shrink-0 px-4 py-2 text-lg font-semibold transition-colors flex items-center gap-2 ${activeTab === 'analytics' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-400 hover:text-white'}`}
            >
                <UsersIcon className="w-5 h-5"/>
                Student Analytics
            </button>
            <button
                onClick={() => setActiveTab('assessments')}
                className={`flex-shrink-0 px-4 py-2 text-lg font-semibold transition-colors flex items-center gap-2 ${activeTab === 'assessments' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-400 hover:text-white'}`}
            >
                <ChecklistIcon className="w-5 h-5"/>
                All Assessments
            </button>
            <button
                onClick={() => setActiveTab('rankings')}
                className={`flex-shrink-0 px-4 py-2 text-lg font-semibold transition-colors flex items-center gap-2 ${activeTab === 'rankings' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-400 hover:text-white'}`}
            >
                <TrophyIcon className="w-5 h-5"/>
                Rankings
            </button>
            <button
                onClick={() => setActiveTab('data')}
                className={`flex-shrink-0 px-4 py-2 text-lg font-semibold transition-colors flex items-center gap-2 ${activeTab === 'data' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-400 hover:text-white'}`}
            >
                <DatabaseIcon className="w-5 h-5"/>
                Data Management
            </button>
        </div>

        {/* Content */}
        {renderContent()}
    </div>
  );
};