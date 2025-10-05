/**
 * Client-side SIWA utilities
 */

import type { SIWAMessage, NonceResponse, AuthResponse } from '../types';

/**
 * Generate a SIWA message for signing
 */
export function generateSIWAMessage(params: {
  address: string;
  nonce: string;
  chainId?: string;
  domain?: string;
  statement?: string;
}): string {
  const now = new Date();
  const expirationTime = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes

  const message: SIWAMessage = {
    address: params.address,
    chainId: params.chainId || 'aptos:testnet',
    nonce: params.nonce,
    issuedAt: now.toISOString(),
    expirationTime: expirationTime.toISOString(),
    domain: params.domain || (typeof window !== 'undefined' ? window.location.host : 'localhost:3000'),
    statement: params.statement || 'Sign in to VeriFi Protocol',
  };

  return JSON.stringify(message);
}

/**
 * Fetch a nonce from the server
 */
export async function fetchNonce(apiUrl?: string): Promise<NonceResponse> {
  const baseUrl = apiUrl || '';
  const response = await fetch(`${baseUrl}/api/auth/siwa/generate-nonce`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch nonce');
  }

  return response.json();
}

/**
 * Verify SIWA signature with server
 */
export async function verifySIWA(params: {
  message: string;
  signature: string;
  publicKey: string;
  apiUrl?: string;
}): Promise<AuthResponse> {
  const baseUrl = params.apiUrl || '';
  const response = await fetch(`${baseUrl}/api/auth/siwa/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // Important for cookies
    body: JSON.stringify({
      message: params.message,
      signature: params.signature,
      publicKey: params.publicKey,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    return {
      success: false,
      error: error.error || 'Verification failed',
    };
  }

  return response.json();
}

/**
 * Complete SIWA login flow
 */
export async function signInWithAptos(params: {
  address: string;
  signMessage: (message: { message: string }) => Promise<{ signature: string; fullMessage: string }>;
  publicKey: string;
  apiUrl?: string;
  chainId?: string;
  statement?: string;
}): Promise<AuthResponse> {
  try {
    // 1. Fetch nonce
    const { nonce } = await fetchNonce(params.apiUrl);

    // 2. Generate SIWA message
    const message = generateSIWAMessage({
      address: params.address,
      nonce,
      chainId: params.chainId,
      statement: params.statement,
    });

    // 3. Sign message with wallet
    const { signature } = await params.signMessage({ message });

    // 4. Verify signature with server
    const result = await verifySIWA({
      message,
      signature,
      publicKey: params.publicKey,
      apiUrl: params.apiUrl,
    });

    return result;
  } catch (error) {
    console.error('SIWA login failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Logout user
 */
export async function logout(apiUrl?: string): Promise<void> {
  const baseUrl = apiUrl || '';
  await fetch(`${baseUrl}/api/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });
}
