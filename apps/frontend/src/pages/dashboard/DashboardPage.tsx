import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/button';

export function DashboardPage() {
	const { user, logout } = useAuthStore();

	return (
		<div className='container mx-auto p-4'>
			<div className='flex justify-between items-center mb-8'>
				<h1 className='text-2xl font-bold'>Dashboard</h1>
				<div className='flex items-center gap-4'>
					<span>
						Welcome, {user?.firstName} {user?.lastName}
					</span>
					<Button variant='outline' onClick={logout}>
						Logout
					</Button>
				</div>
			</div>

			<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
				{/* Add dashboard cards/widgets here */}
				<div className='p-4 border rounded-lg shadow'>
					<h2 className='text-lg font-semibold mb-2'>Quick Stats</h2>
					<p>Role: {user?.role}</p>
					<p>Email: {user?.email}</p>
				</div>
			</div>
		</div>
	);
}
