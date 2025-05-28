import axios from 'axios';
import type {
	LoginFormData,
	RegisterRequestData,
	AuthResponse,
} from '@/types/auth';

const api = axios.create({
	baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
	headers: {
		'Content-Type': 'application/json',
	},
});

// Track ongoing refresh attempts to prevent multiple simultaneous refreshes
let refreshPromise: Promise<AuthResponse> | null = null;

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(
	(config) => {
		const authStorage = localStorage.getItem('auth-storage');
		if (authStorage) {
			const { state } = JSON.parse(authStorage);
			if (state.token) {
				config.headers.Authorization = `Bearer ${state.token}`;
			}
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

// Add a response interceptor to handle token refresh
api.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config;

		// If the error is 401 and we haven't tried to refresh the token yet
		if (error.response?.status === 401 && !originalRequest._retry) {
			originalRequest._retry = true;

			try {
				// If there's already a refresh in progress, wait for it
				if (refreshPromise) {
					const response = await refreshPromise;
					originalRequest.headers.Authorization = `Bearer ${response.accessToken}`;
					return api(originalRequest);
				}

				const authStorage = localStorage.getItem('auth-storage');
				if (!authStorage) {
					throw new Error('No auth storage found');
				}

				const { state } = JSON.parse(authStorage);
				if (!state.refreshToken) {
					throw new Error('No refresh token found');
				}

				// Create a new refresh promise
				refreshPromise = api
					.post<AuthResponse>('/auth/refresh', {
						refreshToken: state.refreshToken,
					})
					.then((response) => {
						// Update the stored tokens
						const newState = {
							...state,
							token: response.data.accessToken,
							refreshToken: response.data.refreshToken,
						};
						localStorage.setItem(
							'auth-storage',
							JSON.stringify({ state: newState })
						);
						return response.data;
					})
					.finally(() => {
						// Clear the refresh promise after 5 seconds
						setTimeout(() => {
							refreshPromise = null;
						}, 5000);
					});

				const response = await refreshPromise;
				originalRequest.headers.Authorization = `Bearer ${response.accessToken}`;
				return api(originalRequest);
			} catch (refreshError) {
				// If refresh fails, clear auth state and redirect to login
				localStorage.removeItem('auth-storage');
				window.location.href = '/auth/login';
				return Promise.reject(refreshError);
			}
		}

		return Promise.reject(error);
	}
);

export const authApi = {
	login: async (data: LoginFormData): Promise<AuthResponse> => {
		const response = await api.post<AuthResponse>('/auth/login', data);
		return response.data;
	},

	register: async (data: RegisterRequestData): Promise<AuthResponse> => {
		const response = await api.post<AuthResponse>('/auth/register', data);
		return response.data;
	},

	logout: async (): Promise<void> => {
		await api.post('/auth/logout');
	},

	refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
		const response = await api.post<AuthResponse>('/auth/refresh', {
			refreshToken,
		});
		return response.data;
	},
};

export default api;
