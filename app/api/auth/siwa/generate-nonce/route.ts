import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST() {
	try {
		// Generate cryptographically secure random nonce
		const nonce = randomBytes(16).toString("hex");

		// Store nonce in database with 5 minute expiration
		await prisma.nonce.create({
			data: {
				nonce,
				expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
				used: false,
			},
		});

		return NextResponse.json({ nonce });
	} catch (error) {
		console.error("Failed to generate nonce:", error);
		return NextResponse.json(
			{ error: "Failed to generate nonce" },
			{ status: 500 },
		);
	}
}
