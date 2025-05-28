export interface LoginFormData {
	email: string;
	password: string;
}

export interface RegisterFormData {
	firstName: string;
	lastName: string;
	email: string;
	password: string;
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
	user: {
		id: string;
		email: string;
		name: string;
		role: 'ADMIN' | 'TEACHER' | 'PARENT' | 'STUDENT';
		createdAt: string;
		updatedAt: string;
	};
}

export interface AuthState {
	user: AuthResponse['user'] | null;
	token: string | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	error: string | null;
}
