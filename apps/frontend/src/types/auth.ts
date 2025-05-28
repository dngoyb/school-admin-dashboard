export interface User {
	id: string;
	email: string;
	name: string;
	role: 'ADMIN' | 'TEACHER' | 'PARENT' | 'STUDENT';
	createdAt: string;
	updatedAt: string;
}

export interface LoginFormData {
	email: string;
	password: string;
}

export interface RegisterFormData extends LoginFormData {
	name: string;
	confirmPassword: string;
}

export interface RegisterRequestData {
	email: string;
	password: string;
	name: string;
}

export interface AuthResponse {
	accessToken: string;
	refreshToken: string;
	user: User;
}

export interface AuthState {
	user: User | null;
	token: string | null;
	refreshToken: string | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	error: string | null;
}
