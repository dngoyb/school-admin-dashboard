import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';

interface ProtectedRouteProps {
	children: React.ReactNode;
	requiredRole?: 'ADMIN' | 'TEACHER' | 'STAFF';
}

export function ProtectedRoute({
	children,
	requiredRole,
}: ProtectedRouteProps) {
	const { isAuthenticated, user, refreshToken } = useAuthStore();
	const location = useLocation();

	useEffect(() => {
		// Try to refresh the token when the component mounts
		if (isAuthenticated) {
			refreshToken();
		}
	}, [isAuthenticated, refreshToken]);

	if (!isAuthenticated) {
		// Redirect to login page but save the attempted url
		return <Navigate to='/auth/login' state={{ from: location }} replace />;
	}

	if (requiredRole && user?.role !== requiredRole) {
		// Redirect to dashboard if user doesn't have the required role
		return <Navigate to='/dashboard' replace />;
	}

	return <>{children}</>;
}
