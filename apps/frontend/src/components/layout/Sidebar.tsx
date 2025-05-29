import {
	Home,
	Users,
	User,
	Book,
	ClipboardList,
	Calendar,
	MessageCircle,
	Settings,
	LogOut,
	BarChart2,
	FileText,
	CheckSquare,
	Bell,
	UserCheck,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth';

const navLinks = [
	{ label: 'Home', icon: <Home size={18} />, path: '/dashboard' },
	{ label: 'Teachers', icon: <Users size={18} />, path: '/teachers' },
	{ label: 'Students', icon: <User size={18} />, path: '/students' },
	{ label: 'Parents', icon: <UserCheck size={18} />, path: '/parents' },
	{ label: 'Subjects', icon: <Book size={18} />, path: '/subjects' },
	{ label: 'Classes', icon: <ClipboardList size={18} />, path: '/classes' },
	{ label: 'Lessons', icon: <FileText size={18} />, path: '/lessons' },
	{ label: 'Exams', icon: <CheckSquare size={18} />, path: '/exams' },
	{
		label: 'Assignments',
		icon: <ClipboardList size={18} />,
		path: '/assignments',
	},
	{ label: 'Results', icon: <BarChart2 size={18} />, path: '/results' },
	{ label: 'Attendance', icon: <CheckSquare size={18} />, path: '/attendance' },
	{ label: 'Events', icon: <Calendar size={18} />, path: '/events' },
	{ label: 'Messages', icon: <MessageCircle size={18} />, path: '/messages' },
	{ label: 'Announcements', icon: <Bell size={18} />, path: '/announcements' },
];

const otherLinks = [
	{ label: 'Profile', icon: <User size={18} />, path: '/profile' },
	{ label: 'Settings', icon: <Settings size={18} />, path: '/settings' },
];

export function Sidebar() {
	const { logout } = useAuthStore();
	return (
		<aside className='h-screen w-52 bg-background text-foreground flex flex-col'>
			<div>
				<div className='flex items-center gap-1 px-3 py-3'>
					<span className='font-bold text-lg text-primary'>SchooLama</span>
				</div>
				<nav className='mt-1 px-2'>
					<ul className='space-y-1'>
						{navLinks.map((link) => (
							<li key={link.label}>
								<a
									href={link.path}
									className='flex items-center gap-2 px-2 py-2 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition text-sm'>
									{link.icon}
									<span>{link.label}</span>
								</a>
							</li>
						))}
					</ul>
				</nav>
				<div className='px-2 mt-8'>
					<div className='text-xs text-muted-foreground px-2 mb-1'>OTHER</div>
					<ul className='space-y-1'>
						{otherLinks.map((link) => (
							<li key={link.label}>
								<a
									href={link.path}
									className='flex items-center gap-2 px-2 py-2 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition text-sm'>
									{link.icon}
									<span>{link.label}</span>
								</a>
							</li>
						))}
					</ul>
				</div>
			</div>
			<div className='px-2 pb-3 mt-auto'>
				<button
					onClick={logout}
					className='w-full flex items-center gap-2 px-2 py-2 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition font-medium text-sm'>
					<LogOut size={18} />
					<span>Logout</span>
				</button>
			</div>
		</aside>
	);
}
