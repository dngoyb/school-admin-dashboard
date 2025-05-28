import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';

function App() {
	return (
		<BrowserRouter>
			<Routes>
				{/* Auth routes */}
				<Route path='/auth/login' element={<LoginPage />} />
				<Route path='/auth/register' element={<RegisterPage />} />

				{/* Redirect root to login */}
				<Route path='/' element={<Navigate to='/auth/login' replace />} />

				{/* TODO: Add protected dashboard routes */}
				<Route path='/dashboard/*' element={<div>Dashboard (Protected)</div>} />

				{/* Catch all route */}
				<Route path='*' element={<Navigate to='/auth/login' replace />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;
