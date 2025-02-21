const axios = require('axios');
const API_URL = 'http://localhost:8000/api/auth/';

const authService = {
    async register(username, email, password, confirmPassword) {
        try {
            const response = await axios.post(API_URL + 'register/', {
                username,
                email,
                password,
                confirm_password: confirmPassword
            });
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            if (error.response?.data) {
                // Handle specific error messages from backend
                if (error.response.data.username) {
                    throw new Error(error.response.data.username[0]);
                } else if (error.response.data.email) {
                    throw new Error(error.response.data.email[0]);
                } else if (error.response.data.password) {
                    throw new Error(error.response.data.password[0]);
                } else if (typeof error.response.data === 'string') {
                    throw new Error(error.response.data);
                }
            }
            throw new Error('Registration failed. Please try again.');
        }
    },

    async login(username, password) {
        try {
            const response = await axios.post(API_URL + 'login/', {
                username,
                password
            });
            if (response.data.tokens) {
                localStorage.setItem('accessToken', response.data.tokens.access);
                localStorage.setItem('refreshToken', response.data.tokens.refresh);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Login error:', error);
            return false;
        }
    },

    async logout() {
        try {
            const token = localStorage.getItem('accessToken');
            if (token) {
                await axios.post(API_URL + 'logout/', {
                    refresh_token: localStorage.getItem('refreshToken')
                }, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
            }
            // Clear storage regardless of API call success
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            return true;
        } catch (error) {
            // Clear storage even if API call fails
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            console.error('Logout error:', error);
            return true; // Return true anyway since we want to redirect
        }
    },

    isAuthenticated() {
        return !!localStorage.getItem('accessToken');
    }
};

module.exports = authService;