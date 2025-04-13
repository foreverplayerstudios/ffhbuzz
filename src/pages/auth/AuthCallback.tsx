import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Handle the OAuth callback
    const handleAuthCallback = async () => {
      const { error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error during auth callback:', error);
        navigate('/auth/login?error=callback_error');
      } else {
        // Successfully authenticated
        navigate('/');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 border-2 border-primary-500/20 rounded-full animate-ping" />
        <div className="absolute inset-0 border-2 border-t-primary-500 rounded-full animate-spin" />
      </div>
    </div>
  );
};