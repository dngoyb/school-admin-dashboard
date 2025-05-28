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

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem('auth-storage')
			? JSON.parse(localStorage.getItem('auth-storage')!).state.token
			: null;

		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response?.status === 401) {
			// Clear auth state on unauthorized
			localStorage.removeItem('auth-storage');
			window.location.href = '/auth/login';
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

	refreshToken: async (): Promise<{ token: string }> => {
		const response = await api.post<{ token: string }>('/auth/refresh');
		return response.data;
	},
};

export default api;
