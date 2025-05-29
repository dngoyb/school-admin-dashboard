import { useAuthStore } from '@/store/auth';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';

export function DashboardPage() {
	const { user } = useAuthStore();

	return (
		<div className='min-h-screen flex bg-background'>
			<Sidebar />
			<div className='flex-1'>
				<Topbar />
				<main className='container mx-auto p-2'>
					<div className='grid gap-2 md:grid-cols-2 lg:grid-cols-3'>
						{/* Add dashboard cards/widgets here */}
						<div className='p-2 border rounded-lg bg-card shadow-sm'>
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
		</div>
	);
}
