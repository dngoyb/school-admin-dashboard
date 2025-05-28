import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { loginSchema, type LoginFormData } from '@/lib/validations/auth';
import { useAuthStore } from '@/store/auth';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export function LoginPage() {
	const navigate = useNavigate();
	const { login, isLoading, error, clearError } = useAuthStore();
	const [showPassword, setShowPassword] = useState(false);

	const form = useForm<LoginFormData>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: '',
			password: '',
		},
	});

	const onSubmit = async (data: LoginFormData) => {
		try {
			clearError();
			await login(data);
			navigate('/dashboard');
		} catch (error) {
			// Error is handled by the store
			console.error('Login error:', error);
		}
	};

	return (
		<AuthLayout
			title='Sign in to your account'
			subtitle='Enter your credentials to access your account'
			footerText="Don't have an account?"
			footerLink='/auth/register'
			footerLinkText='Sign up'>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
					{error && (
						<div className='p-3 text-sm text-red-500 bg-red-50 rounded-md'>
							{error}
						</div>
					)}

					<FormField
						control={form.control}
						name='email'
						render={({ field }) => (
							<FormItem>
								<FormLabel>Email</FormLabel>
								<FormControl>
									<Input
										type='email'
										placeholder='Enter your email'
										className='pr-10'
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name='password'
						render={({ field }) => (
							<FormItem>
								<FormLabel>Password</FormLabel>
								<FormControl>
									<div className='relative group'>
										<Input
											type={showPassword ? 'text' : 'password'}
											placeholder='Enter your password'
											className={cn(
												'pr-10 transition-colors',
												'focus-visible:ring-offset-0',
												showPassword && 'pr-10'
											)}
											{...field}
										/>
										<Button
											type='button'
											variant='ghost'
											size='sm'
											className={cn(
												'absolute right-0 top-0 h-full px-3 py-2',
												'opacity-70 hover:opacity-100 transition-opacity',
												'focus-visible:ring-offset-0 focus-visible:ring-1',
												'focus-visible:ring-gray-400 focus-visible:bg-gray-50',
												'active:bg-gray-100'
											)}
											onClick={() => setShowPassword(!showPassword)}>
											{showPassword ? (
												<EyeOff className='h-4 w-4 text-gray-500 transition-colors group-hover:text-gray-700' />
											) : (
												<Eye className='h-4 w-4 text-gray-500 transition-colors group-hover:text-gray-700' />
											)}
											<span className='sr-only'>
												{showPassword ? 'Hide password' : 'Show password'}
											</span>
										</Button>
									</div>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<Button
						type='submit'
						className='w-full transition-colors'
						disabled={isLoading}>
						{isLoading ? 'Signing in...' : 'Sign in'}
					</Button>
				</form>
			</Form>
		</AuthLayout>
	);
}
