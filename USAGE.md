# VeriFi Auth - Usage Guide

Complete examples for integrating `@verifi/auth` in your Aptos application.

## Installation

```bash
pnpm add @verifi/auth zustand
```

## Quick Start

### 1. Setup Database

```bash
# Copy schema to your project
cp node_modules/@verifi/auth/prisma/schema.prisma ./prisma/

# Run migrations
pnpm prisma migrate dev --name add_auth_tables
pnpm prisma generate
```

### 2. Setup Environment Variables

```bash
# .env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
JWT_SECRET="your-32-character-secret-key-here"
SESSION_MAX_AGE=86400
NEXT_PUBLIC_APP_DOMAIN="localhost:3000"
```

### 3. Copy API Routes

Copy the API routes from the package to your Next.js app:

```bash
cp -r node_modules/@verifi/auth/app/api/auth ./app/api/
```

### 4. Wrap App with SessionProvider

```tsx
// app/layout.tsx
import { SessionProvider } from '@verifi/auth';
import { AptosWalletAdapterProvider } from '@aptos-labs/wallet-adapter-react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AptosWalletAdapterProvider>
          <SessionProvider>
            {children}
          </SessionProvider>
        </AptosWalletAdapterProvider>
      </body>
    </html>
  );
}
```

## Component Examples

### Simple Login Button

```tsx
import { LoginButton, WalletLogin } from '@verifi/auth';
import { WalletSelector } from '@aptos-labs/wallet-adapter-react';

export function Header() {
  return (
    <header>
      <WalletSelector />
      <WalletLogin>
        Sign in with Wallet
      </WalletLogin>
      <LoginButton />
    </header>
  );
}
```

### Protected Route

```tsx
import { AuthGuard } from '@verifi/auth';

export default function ProtectedPage() {
  return (
    <AuthGuard fallback={<div>Please sign in to view this page</div>}>
      <div>Protected content here</div>
    </AuthGuard>
  );
}
```

### Using the Auth Hook

```tsx
'use client';

import { useAuth } from '@verifi/auth';

export function ProfileButton() {
  const { isAuthenticated, address, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <div>Please sign in</div>;
  }

  return (
    <div>
      Welcome {address?.slice(0, 6)}...{address?.slice(-4)}
    </div>
  );
}
```

### Custom SIWA Flow

```tsx
'use client';

import { useSIWA } from '@verifi/auth';
import { useWallet } from '@aptos-labs/wallet-adapter-react';

export function CustomLogin() {
  const { account, signMessage } = useWallet();
  const { signIn, isLoading, error } = useSIWA({
    onSuccess: (response) => {
      console.log('Logged in!', response.address);
      // Redirect or update UI
    },
    onError: (error) => {
      console.error('Login failed:', error.message);
    },
  });

  const handleLogin = async () => {
    if (!account || !signMessage) return;

    await signIn({
      address: account.address,
      signMessage: signMessage as any,
      publicKey: account.publicKey.toString(),
      statement: 'Sign in to my awesome app',
    });
  };

  return (
    <div>
      <button onClick={handleLogin} disabled={isLoading}>
        {isLoading ? 'Signing in...' : 'Sign in'}
      </button>
      {error && <div className="text-red-500">{error.message}</div>}
    </div>
  );
}
```

## Server-Side Examples

### Protected API Route

```tsx
// app/api/protected/route.ts
import { withAuth } from '@verifi/auth';
import { NextResponse } from 'next/server';

export const GET = withAuth(async (req, session) => {
  // session.address and session.userId are available
  return NextResponse.json({
    message: 'Protected data',
    user: session.address,
  });
});
```

### Optional Auth API Route

```tsx
// app/api/data/route.ts
import { withOptionalAuth } from '@verifi/auth';
import { NextResponse } from 'next/server';

export const GET = withOptionalAuth(async (req, session) => {
  // session can be null
  const isAuthenticated = session !== null;

  return NextResponse.json({
    public: 'This is public data',
    private: isAuthenticated ? 'Secret data' : null,
  });
});
```

### Manual Session Check

```tsx
// app/api/custom/route.ts
import { getSessionFromRequest } from '@verifi/auth';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const session = await getSessionFromRequest(req);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Use session.address, session.userId
  return NextResponse.json({ user: session.address });
}
```

## Advanced Usage

### Custom API URL (for monorepo or microservices)

```tsx
import { useSIWA } from '@verifi/auth';

const { signIn } = useSIWA({
  apiUrl: 'https://auth.myapp.com', // Custom auth service URL
});
```

### Custom Styling

```tsx
<WalletLogin
  buttonClassName="my-custom-button"
  loadingClassName="my-loading-button"
>
  <span>🔐 Sign In</span>
</WalletLogin>
```

### Session Storage Customization

The auth state is automatically persisted to localStorage using Zustand. You can access it directly:

```tsx
import { useAuthStore } from '@verifi/auth';

// Direct store access
const session = useAuthStore((state) => state.session);
const setSession = useAuthStore((state) => state.setSession);
```

## TypeScript Support

All components and hooks are fully typed:

```tsx
import type { AuthSession, SIWAMessage, AuthResponse } from '@verifi/auth';

const session: AuthSession = {
  address: '0x123...',
  userId: 'uuid',
  loginTime: Date.now(),
};
```

## Troubleshooting

### "Module not found: @/lib/db"

Make sure you've copied the API routes to your project. The package exports utilities but you need to host the API routes in your Next.js app.

### "Prisma Client not generated"

Run `pnpm prisma generate` after adding the schema to your project.

### Session not persisting

Make sure you're using `credentials: 'include'` in fetch calls and that your cookies are configured correctly.

## Next Steps

- Add Passkeys support (Phase 2)
- Customize session expiration
- Add refresh token logic
- Implement role-based access control (RBAC)

For more examples, see the [GitHub repository](https://github.com/verifi-labs/verifi-auth).
