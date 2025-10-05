import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth/jwe";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
	try {
		const session = await getSessionFromRequest(req);

		if (session) {
			// Invalidate session in database
			await prisma.session.deleteMany({
				where: {
					userId: session.userId,
				},
			});
		}

		// Clear cookie
		const response = NextResponse.json({ success: true });
		response.cookies.set("auth_token", "", {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			maxAge: 0, // Expire immediately
			path: "/",
		});

		return response;
	} catch (error) {
		console.error("Logout failed:", error);
		return NextResponse.json({ error: "Logout failed" }, { status: 500 });
	}
}
