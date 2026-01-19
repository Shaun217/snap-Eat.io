
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

export const Auth: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            if (isSignUp) {
                const { error, data } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                if (data.user && data.session === null) {
                    setMessage({ type: 'success', text: 'Check your email for the confirmation link!' });
                } else {
                    setMessage({ type: 'success', text: 'Account created! You are now logged in.' });
                }
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'An error occurred' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-background-light dark:bg-background-dark text-gray-900 dark:text-gray-100">
            <div className="w-full max-w-sm">
                {/* Branding */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-4 transform rotate-3">
                        <span className="material-symbols-outlined text-[32px]">restaurant_menu</span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Snap & Eat</h1>
                    <p className="text-gray-500 text-sm">Scan, discover, and savor delicious food.</p>
                </div>

                <div className="bg-white dark:bg-surface-dark p-8 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-white/5">
                    <h2 className="text-xl font-bold mb-6 text-center">
                        {isSignUp ? 'Create Account' : 'Welcome Back'}
                    </h2>

                    {message && (
                        <div className={`p-3 rounded-lg text-sm mb-4 font-medium ${message.type === 'error'
                                ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-300'
                                : 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-300'
                            }`}>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleAuth} className="flex flex-col gap-4">
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-400 mb-1.5 ml-1">Email</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">mail</span>
                                <input
                                    type="email"
                                    placeholder="hello@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium placeholder:font-normal placeholder:text-gray-400"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-400 mb-1.5 ml-1">Password</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">lock</span>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium placeholder:font-normal placeholder:text-gray-400"
                                    required
                                    minLength={6}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="mt-4 w-full bg-primary hover:bg-primary-dark active:scale-[0.98] text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-primary/25 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>}
                            {isSignUp ? 'Sign Up' : 'Sign In'}
                        </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-gray-100 dark:border-white/5 text-center">
                        <p className="text-sm text-gray-500">
                            {isSignUp ? "Already have an account?" : "Don't have an account?"}
                            <button
                                onClick={() => {
                                    setIsSignUp(!isSignUp);
                                    setMessage(null);
                                }}
                                className="ml-2 font-bold text-primary hover:text-primary-dark underline decoration-2 decoration-transparent hover:decoration-current transition-all"
                            >
                                {isSignUp ? 'Sign In' : 'Sign Up'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
