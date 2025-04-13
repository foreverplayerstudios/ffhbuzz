import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { SEO } from '../../components/SEO';
import toast from 'react-hot-toast';

export const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signUp(email, password);
      toast.success('Registration successful! Please check your email to verify your account.');
      navigate('/auth/login');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO
        title="Sign Up - FreeFilmHub"
        description="Create your FreeFilmHub account to start streaming your favorite movies and TV shows."
      />

      <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#0f0f0f]">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <Link 
              to="/"
              className="inline-flex items-center gap-2 text-2xl font-bold text-white hover:text-primary-400 transition-colors"
            >
              <UserPlus className="w-8 h-8" />
              <span>Create Account</span>
            </Link>
            <p className="mt-2 text-gray-400">
              Join FreeFilmHub to start watching your favorite content.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                  Email address
                </label>
                <div className="mt-1 relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full px-4 py-3 pl-12 border border-white/10 rounded-lg bg-white/5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/20"
                    placeholder="Enter your email"
                  />
                  <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                  Password
                </label>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full px-4 py-3 pl-12 border border-white/10 rounded-lg bg-white/5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/20"
                    placeholder="Create a password"
                  />
                  <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </div>

            <div className="flex items-center justify-center">
              <div className="text-sm">
                <span className="text-gray-500">Already have an account?</span>{' '}
                <Link
                  to="/auth/login"
                  className="font-medium text-primary-400 hover:text-primary-300"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};