import React from 'react';
import { Link } from 'react-router-dom';
import { Home, AlertCircle } from 'lucide-react';
import { SEO } from '../components/SEO';

export const NotFound = () => {
  return (
    <>
      <SEO
        title="404 - Page Not Found"
        description="The page you're looking for doesn't exist or has been moved."
      />

      <main className="min-h-screen bg-[#0f0f0f] flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">404 - Page Not Found</h1>
          <AlertCircle className="w-16 h-16 text-primary-500 mx-auto mb-6" />
          <p className="text-gray-400 mb-8 max-w-md">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all duration-300 hover:scale-105"
          >
            <Home className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>
        </div>
      </main>
    </>
  );
};