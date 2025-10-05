# VeriFi Auth

Modern authentication for Web3 applications using **Sign In With Aptos (SIWA)** and **Passkeys** (WebAuthn).

## Features

- **SIWA (Sign In With Aptos)**: Cryptographic wallet authentication
- **JWE Encryption**: Secure session tokens with AES-256-GCM
- **HTTP-Only Cookies**: Protection against XSS attacks
- **Nonce-based Anti-Replay**: One-time use nonces with 5-minute TTL
- **Passkey Support** (Phase 2): Biometric authentication via Face ID, Touch ID, Windows Hello

## Architecture

```
Wallet Connect → Sign SIWA Message → Verify Signature → Generate JWE → Store Session → Set Cookie
```

## Installation

```bash
pnpm install
```

## Setup

1. Copy environment variables:
```bash
cp .env.example .env
```

2. Generate JWT secret:
```bash
openssl rand -base64 32
```

3. Update `.env` with your database URL and JWT secret

4. Run Prisma migrations:
```bash
pnpm db:migrate
pnpm db:generate
```

## Development

```bash
pnpm dev
```

Runs on http://localhost:3100

## Database

Uses PostgreSQL with Prisma ORM. Tables:
- `users` - User accounts
- `sessions` - Active sessions with encrypted tokens
- `nonces` - SIWA anti-replay protection
- `challenges` - Passkey authentication (Phase 2)

## API Routes

### POST /api/auth/siwa/generate-nonce
Generates unique nonce for SIWA authentication.

**Response:**
```json
{
  "nonce": "a1b2c3d4..."
}
```

### POST /api/auth/siwa/verify
Verifies SIWA signature and creates session.

**Request:**
```json
{
  "message": "{...}",
  "signature": "0x...",
  "publicKey": "0x..."
}
```

**Response:**
```json
{
  "success": true,
  "address": "0x...",
  "token": "eyJhbGciOiJkaXIi..."
}
```

Sets `auth_token` HTTP-only cookie with 24h expiration.

### POST /api/auth/logout
Invalidates session and clears cookie.

## Security

- **JWE Tokens**: Encrypted payloads (not just signed like JWT)
- **HTTP-Only Cookies**: Cannot be accessed via JavaScript
- **Secure Flag**: Enforced in production
- **SameSite**: Lax for CSRF protection
- **Nonce Expiration**: 5-minute TTL
- **Session Expiration**: 24 hours

## Usage Example

```typescript
import { useAuth } from '@verifi/auth';

function LoginButton() {
  const { signIn, isAuthenticated, address } = useAuth();

  if (isAuthenticated) {
    return <div>Connected: {address}</div>;
  }

  return <button onClick={signIn}>Sign In</button>;
}
```

## Phase 2: Passkeys

Future implementation will include:
- SimpleWebAuthn integration
- Passkey registration/authentication
- Multi-device sync (Google/Apple)
- Biometric login

## License

MIT
