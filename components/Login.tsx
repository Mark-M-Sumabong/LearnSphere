import React, { useState } from 'react';
import { getSupabaseClient } from '../services/supabaseClient';
import { BrainCircuitIcon } from './icons/BrainCircuitIcon';
import { AlertTriangleIcon } from './icons/AlertTriangleIcon';

export const Login: React.FC = () => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const trimmedUsername = username.trim();
    if (!trimmedUsername || !password) {
        setError("Username and password are required.");
        setLoading(false);
        return;
    }

    // Sanitize username to create a fake email, preventing need for real emails in demo
    const emailPrefix = trimmedUsername.toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (!emailPrefix) {
        setError("Please enter a valid username with alphanumeric characters.");
        setLoading(false);
        return;
    }
    const email = `${emailPrefix}@learnsphere.demo`;

    try {
        const supabase = getSupabaseClient();
        
        if (isLoginView) {
            // --- Handle Login (v2 API) ---
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (signInError) {
                throw signInError;
            }
            // onAuthStateChange in UserContext will handle success
        } else {
            // --- Handle Sign Up (v2 API) ---
            const signUpData = {
                username: trimmedUsername,
                // Assign 'admin' role if username is 'admin', otherwise 'user'
                role: trimmedUsername.toLowerCase() === 'admin' ? 'admin' : 'user'
            };

            const { error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: signUpData
                }
            });

            if (signUpError) {
                if (signUpError.message.includes('User already registered')) {
                   setError('This username is already taken. Please try logging in or choose a different username.');
                } else {
                    throw signUpError;
                }
            }
             // onAuthStateChange in UserContext will handle success
             // This assumes email confirmation is disabled in Supabase project settings.
        }

    } catch (err: any) {
        setError(err.error_description || err.message);
    } finally {
        setLoading(false);
    }
  };

  const toggleView = () => {
      setIsLoginView(!isLoginView);
      setError(null);
      setUsername('');
      setPassword('');
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen -mt-20">
        <div className="w-full max-w-md p-8 space-y-6 bg-gray-800/50 border border-gray-700 rounded-lg shadow-2xl">
            <div className="text-center">
                <BrainCircuitIcon className="w-16 h-16 text-indigo-400 mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-white">Welcome to LearnSphere AI</h1>
                <p className="mt-2 text-gray-400">{isLoginView ? 'Sign in to your account' : 'Create a new account'}</p>
            </div>
            <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="username" className="sr-only">Username</label>
                    <input
                        id="username"
                        name="username"
                        type="text"
                        autoComplete="username"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="appearance-none rounded-t-md relative block w-full px-3 py-3 border border-gray-600 bg-gray-900 placeholder-gray-500 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                        placeholder="Username"
                    />
                </div>
                <div>
                    <label htmlFor="password"className="sr-only">Password</label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete={isLoginView ? "current-password" : "new-password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="appearance-none rounded-b-md relative block w-full px-3 py-3 border border-gray-600 bg-gray-900 placeholder-gray-500 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                        placeholder="Password"
                    />
                </div>
                
                {error && (
                    <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-md flex items-center gap-3 text-sm animate-fade-in">
                        <AlertTriangleIcon className="w-5 h-5 flex-shrink-0" />
                        <p>{error}</p>
                    </div>
                )}
                
                <div>
                    <button
                        type="submit"
                        disabled={loading || !username.trim() || !password.trim()}
                        className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed transition duration-200"
                    >
                        {loading ? 'Processing...' : (isLoginView ? 'Login' : 'Sign Up')}
                    </button>
                </div>
                <div className="text-center">
                    <button type="button" onClick={toggleView} className="text-sm font-medium text-indigo-400 hover:text-indigo-300">
                        {isLoginView ? "Don't have an account? Sign Up" : "Already have an account? Login"}
                    </button>
                </div>
            </form>
        </div>
    </div>
  );
};