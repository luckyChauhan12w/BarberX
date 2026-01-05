export interface User {
    id: string;
    email: string;
    fullName: {
        firstName: string;
        lastName: string;
    };
    role: 'CUSTOMER' | 'BARBER' | 'ADMIN';
}

export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterCredentials {
    fullName: {
        firstName: string;
        lastName: string;
    };
    email: string;
    password: string;
    role: 'CUSTOMER' | 'BARBER' | 'ADMIN';
}