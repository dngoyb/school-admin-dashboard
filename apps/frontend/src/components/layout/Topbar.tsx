import { useAuthStore } from '@/store/auth';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

function getInitials(name?: string) {
	if (!name) return '';
	const names = name.split(' ');
	return names
		.map((n) => n[0])
		.join('')
		.toUpperCase();
}

export function Topbar() {
	const { user } = useAuthStore();

	return (
		<header className='bg-background sticky top-0 z-10'>
			<div className='flex justify-between items-center px-4 py-2'>
				<div className='flex items-center gap-2'>
					<div className='relative'>
						<Search className='absolute left-2 top-2 h-4 w-4 text-muted-foreground' />
						<Input
							type='text'
							placeholder='Search...'
							className='pl-8 w-48 bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary h-8 text-sm'
						/>
					</div>
				</div>
				<div className='flex items-center gap-2'>
					<ThemeToggle />
					<div className='flex flex-col items-end'>
						<span className='font-medium text-sm text-foreground'>
							{user?.name}
						</span>
						<span className='text-xs text-muted-foreground capitalize'>
							{user?.role?.toLowerCase()}
						</span>
					</div>
					<div className='w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-foreground'>
						{getInitials(user?.name)}
					</div>
				</div>
			</div>
		</header>
	);
}
