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

    isAuthenticated() {
        return localStorage.getItem('accessToken') !== null;
    },

    logout() {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
    }
};

module.exports = authService;