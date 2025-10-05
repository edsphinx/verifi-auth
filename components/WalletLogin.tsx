'use client';

/**
 * Wallet login component with SIWA integration
 */

import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { useSIWA } from '../lib/hooks/use-siwa';
import { useAuth } from '../lib/hooks/use-auth';

interface WalletLoginProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  buttonClassName?: string;
  loadingClassName?: string;
  children?: React.ReactNode;
}

export function WalletLogin({
  onSuccess,
  onError,
  buttonClassName = 'px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50',
  loadingClassName = 'px-4 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed',
  children,
}: WalletLoginProps) {
  const { account, signMessage, connected } = useWallet();
  const { setSession } = useAuth();
  const { signIn, isLoading } = useSIWA({
    onSuccess: (response) => {
      if (response.success && response.address) {
        setSession({
          address: response.address,
          userId: response.address, // Will be updated by backend
          loginTime: Date.now(),
        });
        onSuccess?.();
      }
    },
    onError: (error) => {
      onError?.(new Error(error.message));
    },
  });

  const handleSignIn = async () => {
    if (!account || !signMessage) {
      onError?.(new Error('Wallet not connected'));
      return;
    }

    await signIn({
      address: account.address,
      signMessage: signMessage as (msg: { message: string }) => Promise<{ signature: string; fullMessage: string }>,
      publicKey: account.publicKey.toString(),
    });
  };

  if (!connected) {
    return null;
  }

  return (
    <button
      onClick={handleSignIn}
      disabled={isLoading}
      className={isLoading ? loadingClassName : buttonClassName}
      type="button"
    >
      {isLoading ? 'Signing in...' : (children || 'Sign in with Wallet')}
    </button>
  );
}
