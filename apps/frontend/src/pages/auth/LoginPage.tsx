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

export function LoginPage() {
	const navigate = useNavigate();
	const form = useForm<LoginFormData>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: '',
			password: '',
		},
	});

	const onSubmit = async (data: LoginFormData) => {
		try {
			// TODO: Implement login logic
			console.log('Login data:', data);
			// After successful login, redirect to dashboard
			navigate('/dashboard');
		} catch (error) {
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
									<Input
										type='password'
										placeholder='Enter your password'
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<Button
						type='submit'
						className='w-full'
						disabled={form.formState.isSubmitting}>
						{form.formState.isSubmitting ? 'Signing in...' : 'Sign in'}
					</Button>
				</form>
			</Form>
		</AuthLayout>
	);
}
