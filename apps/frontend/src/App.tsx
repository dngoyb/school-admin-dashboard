import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate,
} from 'react-router-dom';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuthStore } from '@/store/auth';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { Toaster } from 'sonner';
import { useTheme } from 'next-themes';

function AppContent() {
	const { isAuthenticated } = useAuthStore();
	const { theme } = useTheme();

	return (
		<>
			<Router>
				<Routes>
					{/* Public routes */}
					<Route
						path='/auth/login'
						element={
							isAuthenticated ? (
								<Navigate to='/dashboard' replace />
							) : (
								<LoginPage />
							)
						}
					/>
					<Route
						path='/auth/register'
						element={
							isAuthenticated ? (
								<Navigate to='/dashboard' replace />
							) : (
								<RegisterPage />
							)
						}
					/>

					{/* Protected routes */}
					<Route
						path='/dashboard'
						element={
							<ProtectedRoute>
								<DashboardPage />
							</ProtectedRoute>
						}
					/>

					{/* Admin only routes */}
					<Route
						path='/admin/*'
						element={
							<ProtectedRoute requiredRole='ADMIN'>
								{/* Add admin routes here */}
								<div>Admin Dashboard</div>
							</ProtectedRoute>
						}
					/>

					{/* Teacher only routes */}
					<Route
						path='/teacher/*'
						element={
							<ProtectedRoute requiredRole='TEACHER'>
								{/* Add teacher routes here */}
								<div>Teacher Dashboard</div>
							</ProtectedRoute>
						}
					/>

					{/* Parent only routes */}
					<Route
						path='/parent/*'
						element={
							<ProtectedRoute requiredRole='PARENT'>
								{/* Add parent routes here */}
								<div>Parent Dashboard</div>
							</ProtectedRoute>
						}
					/>

					{/* Student only routes */}
					<Route
						path='/student/*'
						element={
							<ProtectedRoute requiredRole='STUDENT'>
								{/* Add student routes here */}
								<div>Student Dashboard</div>
							</ProtectedRoute>
						}
					/>

					{/* Redirect root to dashboard if authenticated, otherwise to login */}
					<Route
						path='/'
						element={
							isAuthenticated ? (
								<Navigate to='/dashboard' replace />
							) : (
								<Navigate to='/auth/login' replace />
							)
						}
					/>

					{/* Catch all route */}
					<Route path='*' element={<Navigate to='/' replace />} />
				</Routes>
			</Router>
			<Toaster
				position='top-right'
				expand={false}
				richColors
				closeButton
				theme={theme as 'light' | 'dark' | 'system'}
			/>
		</>
	);
}

function App() {
	return (
		<ThemeProvider>
			<div className='flex-1'>
				<AppContent />
			</div>
		</ThemeProvider>
	);
}

export default App;
