// auth.js
const API_URL = 'http://localhost:8000/api';

// Check if user is authenticated
function checkAuth() {
    const token = localStorage.getItem('accessToken');
    if (!token && !window.location.href.includes('login.html') && !window.location.href.includes('register.html')) {
        window.location.href = 'login.html';
    }
}

// Handle Login
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch(`${API_URL}/auth/login/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('accessToken', data.tokens.access);
                localStorage.setItem('refreshToken', data.tokens.refresh);
                localStorage.setItem('username', username);
                window.location.href = 'index.html';
            } else {
                document.getElementById('errorMessage').textContent = data.error || 'Login failed';
            }
        } catch (error) {
            document.getElementById('errorMessage').textContent = 'An error occurred. Please try again.';
        }
    });
}

// Handle Registration
if (document.getElementById('registerForm')) {
    document.getElementById('registerForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        try {
            const response = await fetch(`${API_URL}/auth/register/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username,
                    email,
                    password,
                    confirm_password: confirmPassword
                }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('accessToken', data.tokens.access);
                localStorage.setItem('refreshToken', data.tokens.refresh);
                localStorage.setItem('username', username);
                window.location.href = 'index.html';
            } else {
                const errorMessage = Object.values(data).flat().join('\n');
                document.getElementById('errorMessage').textContent = errorMessage || 'Registration failed';
            }
        } catch (error) {
            document.getElementById('errorMessage').textContent = 'An error occurred. Please try again.';
        }
    });
}

// Handle Logout
function logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('username');
    window.location.href = 'login.html';
}

// Set welcome message on dashboard
if (document.getElementById('welcomeMessage')) {
    const username = localStorage.getItem('username');
    document.getElementById('welcomeMessage').textContent = `Welcome, ${username}!`;
}

// Check authentication on page load
checkAuth();


// // Registration
// async function register(username, email, password, confirmPassword) {
//     const response = await fetch('http://localhost:8000/api/auth/register/', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//             username,
//             email,
//             password,
//             confirm_password: confirmPassword
//         }),
//     });
//     return await response.json();
// }

// // Login
// async function login(username, password) {
//     const response = await fetch('http://localhost:8000/api/auth/login/', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//             username,
//             password
//         }),
//     });
//     return await response.json();
// }