'use client';

import { useGoogleLogin } from '@react-oauth/google';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/AuthContext';
import { useState } from 'react';

interface GoogleLoginButtonProps {
  onSuccess?: (user: any) => void;
  onError?: (error: any) => void;
  className?: string;
}

export function GoogleLoginButton({ onSuccess, onError, className = '' }: GoogleLoginButtonProps) {
  const router = useRouter();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleGoogleSuccess = async (codeResponse: any) => {
    setLoading(true);
    try {
      console.log('[GOOGLE_AUTH] Authentication successful');

      // Exchange code for user info
      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${codeResponse.access_token}`,
        },
      });

      const userData = await response.json();
      console.log('[GOOGLE_AUTH] User data received:', { email: userData.email, name: userData.name });

      // Try to create/update user in database
      try {
        const userResponse = await fetch('/api/users/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: userData.email,
            name: userData.name,
            picture: userData.picture,
            googleId: userData.id,
          }),
        });

        if (userResponse.ok) {
          const dbUser = await userResponse.json();
          console.log('[GOOGLE_AUTH] User saved to database:', dbUser._id);
          login({
            name: dbUser.name,
            email: dbUser.email,
            role: dbUser.role || 'user',
            googleAuth: true,
          });
        } else {
          // Database error, but login anyway (demo mode)
          console.warn('[GOOGLE_AUTH] Database save failed, using demo mode');
          login({
            name: userData.name,
            email: userData.email,
            role: 'user',
            googleAuth: true,
          });
        }
      } catch (dbError) {
        console.warn('[GOOGLE_AUTH] Database error, using demo mode:', dbError);
        login({
          name: userData.name,
          email: userData.email,
          role: 'user',
          googleAuth: true,
        });
      }

      router.push('/dashboard');

      if (onSuccess) {
        onSuccess(userData);
      }
    } catch (error) {
      console.error('[GOOGLE_AUTH] Login failed:', error);
      if (onError) {
        onError(error);
      }
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => {
      console.error('[GOOGLE_AUTH] Google login failed');
      if (onError) {
        onError(new Error('Google login failed'));
      }
    },
    flow: 'implicit',
  });

  if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
    return null; // Don't render if Google Client ID is not set
  }

  return (
    <button
      onClick={() => {
        setLoading(true);
        googleLogin();
      }}
      disabled={loading}
      className={`w-full px-4 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium text-gray-700 ${className}`}
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
      {loading ? 'Signing in...' : 'Sign in with Google'}
    </button>
  );
}
