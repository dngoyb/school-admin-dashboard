export interface LoginFormData {
	email: string;
	password: string;
}

export interface RegisterFormData extends LoginFormData {
	firstName: string;
	lastName: string;
	confirmPassword: string;
}

export interface AuthResponse {
	token: string;
	user: {
		id: string;
		email: string;
		firstName: string;
		lastName: string;
		role: 'ADMIN' | 'TEACHER' | 'STAFF';
	};
}

export interface AuthState {
	user: AuthResponse['user'] | null;
	token: string | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	error: string | null;
}
