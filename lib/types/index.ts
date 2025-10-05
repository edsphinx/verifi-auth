/**
 * Type definitions for VeriFi Auth
 */

export interface AuthSession {
  address: string;
  userId: string;
  loginTime: number;
}

export interface SIWAMessage {
  address: string;
  chainId: string;
  nonce: string;
  issuedAt: string;
  expirationTime: string;
  domain: string;
  statement?: string;
}

export interface AuthResponse {
  success: boolean;
  address?: string;
  token?: string;
  error?: string;
}

export interface NonceResponse {
  nonce: string;
  error?: string;
}

export interface LogoutResponse {
  success: boolean;
  message?: string;
}

export interface AuthError {
  code: string;
  message: string;
}

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';
