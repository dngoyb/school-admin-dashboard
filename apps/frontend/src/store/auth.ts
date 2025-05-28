import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '@/services/api';
import type {
	AuthState,
	LoginFormData,
	RegisterRequestData,
} from '@/types/auth';
import { toast } from 'sonner';
import type { AxiosError } from 'axios';

interface AuthStore extends AuthState {
	// Actions
	login: (data: LoginFormData) => Promise<void>;
	register: (data: RegisterRequestData) => Promise<void>;
	logout: () => Promise<void>;
	refreshAccessToken: () => Promise<void>;
	setError: (error: string | null) => void;
	clearError: () => void;
}

export const useAuthStore = create<AuthStore>()(
	persist(
		(set, get) => ({
			// Initial state
			user: null,
			token: null,
			refreshToken: null,
			isAuthenticated: false,
			isLoading: false,
			error: null,

			// Actions
			login: async (data) => {
				try {
					set({ isLoading: true, error: null });
					const response = await authApi.login(data);
					set({
						user: response.user,
						token: response.accessToken,
						refreshToken: response.refreshToken,
						isAuthenticated: true,
						isLoading: false,
					});
					toast.success('Successfully logged in');
				} catch (error) {
					const errorMessage =
						error instanceof Error
							? error.message
							: 'Failed to login. Please check your credentials.';
					set({
						error: errorMessage,
						isLoading: false,
					});
					toast.error(errorMessage);
					throw error;
				}
			},

			register: async (data) => {
				try {
					set({ isLoading: true, error: null });
					const response = await authApi.register(data);
					set({
						user: response.user,
						token: response.accessToken,
						refreshToken: response.refreshToken,
						isAuthenticated: true,
						isLoading: false,
					});
					toast.success('Account created successfully');
				} catch (error) {
					const errorMessage =
						error instanceof Error
							? error.message
							: 'Failed to register. Please try again.';
					set({
						error: errorMessage,
						isLoading: false,
					});
					toast.error(errorMessage);
					throw error;
				}
			},

			logout: async () => {
				try {
					const { token } = get();
					if (token) {
						try {
							await authApi.logout();
						} catch (error) {
							// Ignore 404 errors since we're logging out anyway
							if ((error as AxiosError).response?.status !== 404) {
								console.error('Logout error:', error);
								toast.error('Failed to logout properly');
							}
						}
					}
					toast.success('Successfully logged out');
				} catch (error) {
					console.error('Logout error:', error);
					toast.error('Failed to logout properly');
				} finally {
					set({
						user: null,
						token: null,
						refreshToken: null,
						isAuthenticated: false,
						error: null,
					});
				}
			},

			refreshAccessToken: async () => {
				try {
					const { refreshToken } = get();
					if (!refreshToken) {
						throw new Error('No refresh token available');
					}

					const response = await authApi.refreshToken(refreshToken);
					set({
						token: response.accessToken,
						refreshToken: response.refreshToken,
						user: response.user,
					});
				} catch (error) {
					console.error('Token refresh error:', error);
					toast.error('Session expired. Please login again.');
					// If refresh fails, logout the user
					get().logout();
				}
			},

			setError: (error) => {
				set({ error });
				toast.error(error);
			},
			clearError: () => set({ error: null }),
		}),
		{
			name: 'auth-storage',
			partialize: (state) => ({
				user: state.user,
				token: state.token,
				refreshToken: state.refreshToken,
				isAuthenticated: state.isAuthenticated,
			}),
		}
	)
);
