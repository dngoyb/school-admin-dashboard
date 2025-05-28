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
	FormDescription,
} from '@/components/ui/form';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { registerSchema, type RegisterFormData } from '@/lib/validations/auth';
import { useAuthStore } from '@/store/auth';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export function RegisterPage() {
	const navigate = useNavigate();
	const { register, isLoading, error, clearError } = useAuthStore();
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	const form = useForm<RegisterFormData>({
		resolver: zodResolver(registerSchema),
		defaultValues: {
			firstName: '',
			lastName: '',
			email: '',
			password: '',
			confirmPassword: '',
		},
	});

	const onSubmit = async (data: RegisterFormData) => {
		try {
			clearError();
			// Transform the data to match the backend's expected format
			const registerData = {
				email: data.email,
				password: data.password,
				name: `${data.firstName} ${data.lastName}`,
			};
			await register(registerData);
			navigate('/dashboard');
		} catch (error) {
			// Error is handled by the store
			console.error('Registration error:', error);
		}
	};

	return (
		<AuthLayout
			title='Create an account'
			subtitle='Enter your information to create an account'
			footerText='Already have an account?'
			footerLink='/login'
			footerLinkText='Login'>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
					<div className='grid grid-cols-2 gap-4'>
						<FormField
							control={form.control}
							name='firstName'
							render={({ field }) => (
								<FormItem>
									<FormLabel>First Name</FormLabel>
									<FormControl>
										<Input placeholder='John' {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name='lastName'
							render={({ field }) => (
								<FormItem>
									<FormLabel>Last Name</FormLabel>
									<FormControl>
										<Input placeholder='Doe' {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					<FormField
						control={form.control}
						name='email'
						render={({ field }) => (
							<FormItem>
								<FormLabel>Email</FormLabel>
								<FormControl>
									<Input
										type='email'
										placeholder='john.doe@example.com'
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
											placeholder='••••••••'
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
								<FormDescription>
									Password must be at least 6 characters and contain uppercase,
									lowercase, and numbers
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name='confirmPassword'
						render={({ field }) => (
							<FormItem>
								<FormLabel>Confirm Password</FormLabel>
								<FormControl>
									<div className='relative group'>
										<Input
											type={showConfirmPassword ? 'text' : 'password'}
											placeholder='••••••••'
											className={cn(
												'pr-10 transition-colors',
												'focus-visible:ring-offset-0',
												showConfirmPassword && 'pr-10'
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
											onClick={() =>
												setShowConfirmPassword(!showConfirmPassword)
											}>
											{showConfirmPassword ? (
												<EyeOff className='h-4 w-4 text-gray-500 transition-colors group-hover:text-gray-700' />
											) : (
												<Eye className='h-4 w-4 text-gray-500 transition-colors group-hover:text-gray-700' />
											)}
											<span className='sr-only'>
												{showConfirmPassword
													? 'Hide password'
													: 'Show password'}
											</span>
										</Button>
									</div>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					{error && (
						<div className='text-sm text-red-500 text-center'>{error}</div>
					)}

					<Button
						type='submit'
						className='w-full transition-colors'
						disabled={isLoading}>
						{isLoading ? 'Creating account...' : 'Create account'}
					</Button>
				</form>
			</Form>
		</AuthLayout>
	);
}
