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
                success: response.status === 201,
                data: response.data
            };
        } catch (error) {
            console.error('Registration error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data || 'Registration failed'
            };
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