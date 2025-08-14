import React, { useState, useEffect, useCallback } from 'react';
import { ProfileWithId, AssessmentResult, QuizAttempt, SkillLevel } from '../types';
import * as storage from '../services/storageService';
import { Spinner } from './ui/Spinner';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import { UsersIcon } from './icons/UsersIcon';

export const StudentAnalyticsView: React.FC = () => {
    const [users, setUsers] = useState<ProfileWithId[]>([]);
    const [selectedUser, setSelectedUser] = useState<ProfileWithId | null>(null);
    const [assessments, setAssessments] = useState<Omit<AssessmentResult, 'username'>[]>([]);
    const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(true);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);

    useEffect(() => {
        const fetchUsers = async () => {
            setIsLoadingUsers(true);
            const profiles = await storage.getAllProfiles();
            setUsers(profiles);
            setIsLoadingUsers(false);
        };
        fetchUsers();
    }, []);

    const handleSelectUser = useCallback(async (user: ProfileWithId) => {
        setSelectedUser(user);
        setIsLoadingDetails(true);
        setAssessments([]);
        setQuizAttempts([]);

        const [userAssessments, userQuizAttempts] = await Promise.all([
            storage.getUserAssessmentResults(user.id),
            storage.getUserQuizAttempts(user.id)
        ]);
        
        setAssessments(userAssessments);
        setQuizAttempts(userQuizAttempts);
        setIsLoadingDetails(false);
    }, []);

    const getSkillLevelColor = (level: SkillLevel) => {
        switch (level) {
            case 'Beginner': return 'text-green-400 bg-green-900/50';
            case 'Intermediate': return 'text-yellow-400 bg-yellow-900/50';
            case 'Advanced': return 'text-red-400 bg-red-900/50';
            default: return 'text-gray-400 bg-gray-700/50';
        }
    }

    const renderUserDetails = () => {
        if (isLoadingDetails) {
            return <div className="flex justify-center items-center h-full"><Spinner className="w-12 h-12" /></div>;
        }
        if (!selectedUser) {
            return (
                <div className="flex flex-col justify-center items-center h-full text-center text-gray-400">
                    <UsersIcon className="w-16 h-16 text-gray-600 mb-4" />
                    <p className="text-lg font-semibold">Select a user to view their analytics.</p>
                </div>
            );
        }
        return (
            <div className="space-y-8">
                <div>
                    <h3 className="text-xl font-bold text-indigo-300 mb-4">Skill Assessments</h3>
                    {assessments.length > 0 ? (
                        <div className="overflow-x-auto bg-gray-900/50 rounded-lg">
                            <table className="min-w-full divide-y divide-gray-700">
                                <thead className="bg-gray-800">
                                    <tr>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Topic</th>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Score</th>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Assigned Level</th>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700">
                                    {assessments.map((result, index) => (
                                        <tr key={index}>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">{result.topic}</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-white">{Math.round(result.score * 100)}%</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getSkillLevelColor(result.skillLevel)}`}>{result.skillLevel}</span></td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-400">{new Date(result.timestamp).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : <p className="text-gray-400">No assessment results found for this user.</p>}
                </div>

                <div>
                    <h3 className="text-xl font-bold text-indigo-300 mb-4">Quiz Attempt History</h3>
                     {quizAttempts.length > 0 ? (
                        <div className="overflow-x-auto bg-gray-900/50 rounded-lg">
                           <table className="min-w-full divide-y divide-gray-700">
                                <thead className="bg-gray-800">
                                    <tr>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Course</th>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Module</th>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Result</th>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Score</th>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700">
                                    {quizAttempts.map((attempt) => (
                                        <tr key={attempt.id}>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">{attempt.courses?.title || 'Unknown Course'}</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">{attempt.module_title}</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm">
                                                {attempt.passed ? 
                                                    <span className="flex items-center gap-1.5 text-green-400"><CheckCircleIcon className="w-4 h-4" /> Passed</span> : 
                                                    <span className="flex items-center gap-1.5 text-red-400"><XCircleIcon className="w-4 h-4" /> Failed</span>
                                                }
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-white">{Math.round(attempt.score * 100)}%</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-400">{new Date(attempt.attempted_at).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : <p className="text-gray-400">No quiz attempt history found for this user.</p>}
                </div>
            </div>
        )
    };

    return (
        <div className="flex flex-col md:flex-row gap-6 min-h-[60vh]">
            <aside className="w-full md:w-1/3 md:max-w-xs flex-shrink-0 bg-gray-900/50 rounded-lg p-4">
                <h2 className="text-lg font-bold text-white mb-4">Users</h2>
                {isLoadingUsers ? (
                    <div className="flex justify-center items-center h-full"><Spinner /></div>
                ) : (
                    <ul className="space-y-2 max-h-[55vh] overflow-y-auto">
                        {users.map(user => (
                            <li key={user.id}>
                                <button
                                    onClick={() => handleSelectUser(user)}
                                    className={`w-full text-left p-3 rounded-md transition-colors ${selectedUser?.id === user.id ? 'bg-indigo-600 text-white' : 'hover:bg-gray-700'}`}
                                >
                                    <p className="font-semibold">{user.username}</p>
                                    <p className={`text-sm ${selectedUser?.id === user.id ? 'text-indigo-200' : 'text-gray-400'}`}>{user.role}</p>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </aside>
            <main className="flex-1 bg-gray-900/50 rounded-lg p-6 overflow-y-auto">
                {renderUserDetails()}
            </main>
        </div>
    );
};