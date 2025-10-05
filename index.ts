/**
 * @verifi/auth - Authentication for Aptos applications
 *
 * Main entry point for the package
 */

// Hooks
export { useAuth, useAuthStore } from './lib/hooks/use-auth';
export { useSIWA } from './lib/hooks/use-siwa';

// Client utilities
export {
  generateSIWAMessage,
  fetchNonce,
  verifySIWA,
  signInWithAptos,
  logout,
} from './lib/client/siwa';

// Components
export { WalletLogin } from './components/WalletLogin';
export { LoginButton } from './components/LoginButton';
export { SessionProvider } from './components/SessionProvider';
export { AuthGuard } from './components/AuthGuard';

// Server utilities (for API routes)
export { withAuth, withOptionalAuth } from './lib/auth/middleware';
export { encryptSession, decryptSession, getSessionFromRequest } from './lib/auth/jwe';
export { verifyJWE } from './lib/auth/verify-jwe';
export { prisma } from './lib/db';

// Types
export type {
  AuthSession,
  SIWAMessage,
  AuthResponse,
  NonceResponse,
  LogoutResponse,
  AuthError,
  AuthStatus,
} from './lib/types';
