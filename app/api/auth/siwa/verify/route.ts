import { NextResponse } from "next/server";
import { Ed25519PublicKey } from "@aptos-labs/ts-sdk";
import { EncryptJWT } from "jose";
import { prisma } from "@/lib/db";

// JWE uses encryption, providing better security for DeFi applications
// This key should be 256 bits (32 bytes) for AES-256-GCM
const JWE_SECRET = new TextEncoder().encode(
	process.env.JWT_SECRET || "your-secret-key-change-in-production-32bytes",
);

interface SIWAMessage {
	address: string;
	chainId: string;
	nonce: string;
	issuedAt: string;
	expirationTime: string;
	domain: string;
	statement?: string;
}

export async function POST(req: Request) {
	try {
		const { message, signature, publicKey } = await req.json();

		if (!message || !signature || !publicKey) {
			return NextResponse.json(
				{ error: "Missing required fields" },
				{ status: 400 },
			);
		}

		const siwaMessage: SIWAMessage = JSON.parse(message);

		// 1. Verify nonce exists and hasn't been used
		const nonceRecord = await prisma.nonce.findUnique({
			where: { nonce: siwaMessage.nonce },
		});

		if (!nonceRecord) {
			return NextResponse.json({ error: "Invalid nonce" }, { status: 400 });
		}

		if (nonceRecord.used) {
			return NextResponse.json(
				{ error: "Nonce already used" },
				{ status: 400 },
			);
		}

		if (new Date() > nonceRecord.expiresAt) {
			return NextResponse.json({ error: "Nonce expired" }, { status: 400 });
		}

		// 2. Verify message hasn't expired
		if (new Date() > new Date(siwaMessage.expirationTime)) {
			return NextResponse.json({ error: "Message expired" }, { status: 400 });
		}

		// 3. Verify signature using Aptos SDK
		const pubKey = new Ed25519PublicKey(publicKey);
		const messageBytes = new TextEncoder().encode(message);
		const signatureBytes = new Uint8Array(
			Buffer.from(signature.replace("0x", ""), "hex"),
		);

		const isValid = pubKey.verifySignature({ message: messageBytes, signature: signatureBytes });

		if (!isValid) {
			return NextResponse.json(
				{ error: "Invalid signature" },
				{ status: 401 },
			);
		}

		// 4. Mark nonce as used
		await prisma.nonce.update({
			where: { nonce: siwaMessage.nonce },
			data: { used: true },
		});

		// 5. Get or create user
		let user = await prisma.user.findUnique({
			where: { address: siwaMessage.address },
		});

		if (!user) {
			user = await prisma.user.create({
				data: {
					address: siwaMessage.address,
					lastLogin: new Date(),
				},
			});
		} else {
			await prisma.user.update({
				where: { address: siwaMessage.address },
				data: { lastLogin: new Date() },
			});
		}

		// 6. Create encrypted session token (JWE for enhanced security)
		// JWE encrypts the payload, making it unreadable without the secret key
		// This is critical for DeFi applications handling sensitive user data
		const jwe = await new EncryptJWT({
			address: siwaMessage.address,
			userId: user.id,
			loginTime: Date.now(),
		})
			.setProtectedHeader({ alg: "dir", enc: "A256GCM" })
			.setIssuedAt()
			.setExpirationTime("24h")
			.encrypt(JWE_SECRET);

		// 7. Store session in database
		const session = await prisma.session.create({
			data: {
				userId: user.id,
				token: jwe,
				expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
			},
		});

		// 8. Set HTTP-only cookie with encrypted token
		const response = NextResponse.json({
			success: true,
			address: siwaMessage.address,
			token: jwe,
		});

		response.cookies.set("auth_token", jwe, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			maxAge: 24 * 60 * 60, // 24 hours
			path: "/",
		});

		return response;
	} catch (error) {
		console.error("SIWA verification failed:", error);
		return NextResponse.json(
			{ error: "Verification failed" },
			{ status: 500 },
		);
	}
}
