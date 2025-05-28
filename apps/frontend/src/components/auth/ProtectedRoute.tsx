import { useEffect, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';

interface ProtectedRouteProps {
	children: React.ReactNode;
	requiredRole?: 'ADMIN' | 'TEACHER' | 'PARENT' | 'STUDENT';
}

export function ProtectedRoute({
	children,
	requiredRole,
}: ProtectedRouteProps) {
	const { isAuthenticated, user, refreshAccessToken } = useAuthStore();
	const location = useLocation();
	const refreshAttempted = useRef(false);

	useEffect(() => {
		let timeoutId: NodeJS.Timeout;

		const attemptRefresh = async () => {
			if (!refreshAttempted.current && isAuthenticated) {
				refreshAttempted.current = true;
				try {
					await refreshAccessToken();
				} catch (error) {
					console.error('Token refresh failed:', error);
				}
				// Reset the flag after 5 minutes to allow future refresh attempts
				timeoutId = setTimeout(() => {
					refreshAttempted.current = false;
				}, 5 * 60 * 1000);
			}
		};

		attemptRefresh();

		return () => {
			if (timeoutId) {
				clearTimeout(timeoutId);
			}
		};
	}, [isAuthenticated]); // Only depend on isAuthenticated

	if (!isAuthenticated) {
		// Reset the refresh attempt flag when logging out
		refreshAttempted.current = false;
		// Redirect to login page but save the attempted url
		return <Navigate to='/auth/login' state={{ from: location }} replace />;
	}

	if (requiredRole && user?.role !== requiredRole) {
		// Redirect to dashboard if user doesn't have the required role
		return <Navigate to='/dashboard' replace />;
	}

	return <>{children}</>;
}
