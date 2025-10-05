"use client";

/**
 * Simple login/logout button component
 */

import { logout } from "../lib/client/siwa";
import { useAuth } from "../lib/hooks/use-auth";

interface LoginButtonProps {
	loginContent?: React.ReactNode;
	logoutContent?: React.ReactNode;
	onLogin?: () => void;
	onLogout?: () => void;
	className?: string;
	showAddress?: boolean;
}

export function LoginButton({
	loginContent = "Sign In",
	logoutContent = "Sign Out",
	onLogin,
	onLogout,
	className = "px-4 py-2 rounded-lg font-medium",
	showAddress = true,
}: LoginButtonProps) {
	const { isAuthenticated, address, logout: clearSession } = useAuth();

	const handleLogout = async () => {
		await logout();
		clearSession();
		onLogout?.();
	};

	if (isAuthenticated) {
		return (
			<div className="flex items-center gap-2">
				{showAddress && address && (
					<span className="text-sm text-gray-600">
						{address.slice(0, 6)}...{address.slice(-4)}
					</span>
				)}
				<button
					onClick={handleLogout}
					className={`${className} bg-gray-600 hover:bg-gray-700 text-white`}
					type="button"
				>
					{logoutContent}
				</button>
			</div>
		);
	}

	return (
		<button
			onClick={onLogin}
			className={`${className} bg-blue-600 hover:bg-blue-700 text-white`}
			type="button"
		>
			{loginContent}
		</button>
	);
}
