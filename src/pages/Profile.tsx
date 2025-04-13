import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { SEO } from '../components/SEO';
import { AvatarSelector, DEFAULT_AVATAR } from '../components/AvatarSelector';
import toast from 'react-hot-toast';

export const Profile = () => {
  const { user, signOut, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const getProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('username, avatar_url')
          .eq('id', user?.id)
          .single();

        if (error && error.code !== 'PGRST116') throw error;

        if (data) {
          setUsername(data.username || '');
          setAvatarUrl(data.avatar_url || DEFAULT_AVATAR);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile data');
      }
    };

    if (user) {
      getProfile();
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      await updateProfile({
        username: username || undefined,
        avatar_url: avatarUrl || DEFAULT_AVATAR,
      });

      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

  if (!user) {
    return null;
  }

  return (
    <>
      <SEO
        title="My Profile - FreeFilmHub"
        description="Manage your FreeFilmHub profile settings and preferences."
      />

      <div className="min-h-screen bg-[#0f0f0f] py-12">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white/[0.03] rounded-2xl p-8 backdrop-blur-xl border border-white/[0.05]">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-2xl font-bold text-white">Profile Settings</h1>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 text-red-400 hover:text-red-300 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign out</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="flex flex-col items-center gap-4">
                <label className="block text-sm font-medium text-gray-300">
                  Profile Picture
                </label>
                <AvatarSelector
                  value={avatarUrl}
                  onChange={setAvatarUrl}
                  onClose={() => setShowAvatarModal(!showAvatarModal)}
                  showModal={showAvatarModal}
                />
              </div>

              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-300">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-1 block w-full px-4 py-3 bg-white/[0.03] border border-white/[0.05] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/20"
                  placeholder="Enter your username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Email
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="mt-1 block w-full px-4 py-3 bg-white/[0.03] border border-white/[0.05] rounded-lg text-gray-400 cursor-not-allowed"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {loading ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};