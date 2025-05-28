import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
	AuthState,
	LoginFormData,
	RegisterRequestData,
} from '@/types/auth';
import { authApi } from '@/services/api';

interface AuthStore extends AuthState {
	// Actions
	login: (data: LoginFormData) => Promise<void>;
	register: (data: RegisterRequestData) => Promise<void>;
	logout: () => Promise<void>;
	refreshToken: () => Promise<void>;
	setError: (error: string | null) => void;
	clearError: () => void;
}

export const useAuthStore = create<AuthStore>()(
	persist(
		(set, get) => ({
			// Initial state
			user: null,
			token: null,
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
						token: response.token,
						isAuthenticated: true,
						isLoading: false,
					});
				} catch (error) {
					const errorMessage =
						error instanceof Error
							? error.message
							: 'Failed to login. Please check your credentials.';
					set({
						error: errorMessage,
						isLoading: false,
					});
					throw error;
				}
			},

			register: async (data) => {
				try {
					set({ isLoading: true, error: null });
					const response = await authApi.register(data);
					set({
						user: response.user,
						token: response.token,
						isAuthenticated: true,
						isLoading: false,
					});
				} catch (error) {
					const errorMessage =
						error instanceof Error
							? error.message
							: 'Failed to register. Please try again.';
					set({
						error: errorMessage,
						isLoading: false,
					});
					throw error;
				}
			},

			logout: async () => {
				try {
					const { token } = get();
					if (token) {
						await authApi.logout();
					}
				} catch (error) {
					console.error('Logout error:', error);
				} finally {
					set({
						user: null,
						token: null,
						isAuthenticated: false,
						error: null,
					});
				}
			},

			refreshToken: async () => {
				try {
					const { token } = get();
					if (!token) return;

					const { token: newToken } = await authApi.refreshToken();
					set({ token: newToken });
				} catch (error) {
					console.error('Token refresh error:', error);
					// If refresh fails, logout the user
					get().logout();
				}
			},

			setError: (error) => set({ error }),
			clearError: () => set({ error: null }),
		}),
		{
			name: 'auth-storage',
			partialize: (state) => ({
				token: state.token,
				user: state.user,
				isAuthenticated: state.isAuthenticated,
			}),
		}
	)
);
