import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export function DashboardPage() {
	const { user, logout } = useAuthStore();

	return (
		<div className='min-h-screen bg-background'>
			<header className='border-b'>
				<div className='container mx-auto px-4 py-4'>
					<div className='flex justify-between items-center'>
						<h1 className='text-2xl font-bold text-foreground'>Dashboard</h1>
						<div className='flex items-center gap-4'>
							<ThemeToggle />
							<span className='text-muted-foreground'>
								Welcome, {user?.name}
							</span>
							<Button variant='outline' onClick={logout}>
								Logout
							</Button>
						</div>
					</div>
				</div>
			</header>

			<main className='container mx-auto p-4'>
				<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
					{/* Add dashboard cards/widgets here */}
					<div className='p-4 border rounded-lg bg-card shadow-sm'>
						<h2 className='text-lg font-semibold mb-2 text-foreground'>
							Quick Stats
						</h2>
						<div className='space-y-2 text-muted-foreground'>
							<p>Role: {user?.role}</p>
							<p>Email: {user?.email}</p>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
