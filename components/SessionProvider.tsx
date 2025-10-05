'use client';

/**
 * Session provider that checks auth status on mount
 */

import { useEffect } from 'react';
import { useAuth } from '../lib/hooks/use-auth';

interface SessionProviderProps {
  children: React.ReactNode;
  checkUrl?: string;
}

export function SessionProvider({
  children,
  checkUrl = '/api/auth/session'
}: SessionProviderProps) {
  const { setSession, setStatus } = useAuth();

  useEffect(() => {
    // Check if user has valid session on mount
    async function checkSession() {
      try {
        const response = await fetch(checkUrl, {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          if (data.session) {
            setSession(data.session);
          } else {
            setStatus('unauthenticated');
          }
        } else {
          setStatus('unauthenticated');
        }
      } catch (error) {
        console.error('Session check failed:', error);
        setStatus('unauthenticated');
      }
    }

    checkSession();
  }, [checkUrl, setSession, setStatus]);

  return <>{children}</>;
}
