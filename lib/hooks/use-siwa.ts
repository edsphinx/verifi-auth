'use client';

/**
 * React hook for SIWA authentication
 */

import { useState } from 'react';
import { signInWithAptos, logout as logoutClient } from '../client/siwa';
import type { AuthResponse, AuthError } from '../types';

interface UseSIWAOptions {
  apiUrl?: string;
  onSuccess?: (response: AuthResponse) => void;
  onError?: (error: AuthError) => void;
}

export function useSIWA(options: UseSIWAOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);

  const signIn = async (params: {
    address: string;
    signMessage: (message: { message: string }) => Promise<{ signature: string; fullMessage: string }>;
    publicKey: string;
    chainId?: string;
    statement?: string;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await signInWithAptos({
        ...params,
        apiUrl: options.apiUrl,
      });

      if (!response.success) {
        const authError: AuthError = {
          code: 'SIWA_ERROR',
          message: response.error || 'Authentication failed',
        };
        setError(authError);
        options.onError?.(authError);
        return response;
      }

      options.onSuccess?.(response);
      return response;
    } catch (err) {
      const authError: AuthError = {
        code: 'UNKNOWN_ERROR',
        message: err instanceof Error ? err.message : 'Unknown error',
      };
      setError(authError);
      options.onError?.(authError);
      return { success: false, error: authError.message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await logoutClient(options.apiUrl);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    signIn,
    logout,
    isLoading,
    error,
  };
}
