import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Home } from './pages/Home';
import { Watch } from './pages/Watch';
import { Search } from './pages/Search';
import { Trending } from './pages/Trending';
import { Latest } from './pages/Latest';
import { TopRated } from './pages/TopRated';
import { Genre } from './pages/Genre';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { AuthCallback } from './pages/auth/AuthCallback';
import { Profile } from './pages/Profile';
import { Watchlist } from './pages/Watchlist';
import { History } from './pages/History';
import { NotFound } from './pages/404';
import { Layout } from './components/Layout';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      onError: (error) => {
        if (error instanceof Error && !error.message.includes('recommendations')) {
          console.error('Query error:', error);
        }
      }
    },
  },
});

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/auth/login" element={<Login />} />
              <Route path="/auth/register" element={<Register />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              
              {/* Redirect .html and .php to clean URLs */}
              <Route path="*.html" element={<Navigate to="/" replace />} />
              <Route path="*.php" element={<Navigate to="/" replace />} />
              
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="/search" element={<Search />} />
                <Route path="/trending" element={<Trending />} />
                <Route path="/latest" element={<Latest />} />
                <Route path="/top-rated" element={<TopRated />} />
                <Route path="/genre/:id/:type?" element={<Genre />} />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/watchlist"
                  element={
                    <ProtectedRoute>
                      <Watchlist />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/history"
                  element={
                    <ProtectedRoute>
                      <History />
                    </ProtectedRoute>
                  }
                />
                <Route path="/:mediaType/:id" element={<Watch />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </BrowserRouter>
          <Toaster position="top-right" />
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;