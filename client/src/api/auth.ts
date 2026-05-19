import API from './axios';

export interface UserAuthCredentials {
    name: string;
    phone: string;
    identityNumber: string;
    email: string;
    password: string;
}

export const loginUser = async (credentials: Partial<UserAuthCredentials>) => {
    try {
        const response = await API.post('/users/login', credentials);
        return response.data;
    } catch (error: any) {
        console.error('Login error:', error.response?.data || error.message);
        throw error.response?.data?.message || 'Something went wrong during login';
    }
};

export const registerUser = async (userData: UserAuthCredentials) => {
    try {
        const response = await API.post('/users/login', userData);
        return response.data;
    } catch (error: any) {
        console.error('Registration error:', error.response?.data || error.message);
        throw error.response?.data?.message || 'Something went wrong during registration';
    }
};

export const requestPasswordReset = async (email: string) => {
    try {
        const response = await API.post('/users/forgot-password', { email });
        return response.data;
    } catch (error: any) {
        console.error('Request password reset error:', error.response?.data || error.message);
        throw error.response?.data?.message || 'Something went wrong while requesting password reset';
    }
};

export const resetPassword = async (token: string, newPassword: string) => {
    try {
        const response = await API.post('/users/reset-password', { token, newPassword });
        return response.data;
    } catch (error: any) {
        console.error('Reset password error:', error.response?.data || error.message);
        throw error.response?.data?.message || 'Something went wrong while resetting password';
    }
};

export const changePassword = async (email: string, currentPassword: string, newPassword: string) => {
    try {
        const response = await API.post('/users/change-password', { email, currentPassword, newPassword });
        return response.data;
    } catch (error: any) {
        console.error('Change password error:', error.response?.data || error.message);
        throw error.response?.data?.message || 'Something went wrong while changing password';
    }
};
