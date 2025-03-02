
const toastr = require("toastr")
document.getElementById('sign-in-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const success = await authService.login(username, password);
        if (success) {
            window.location.href = 'profile.html';
            toastr.success("Successfully logged in")
        } else {
          toastr.error('Login failed. Please check your credentials.');
        }
    } catch (error) {
        console.error('Login error:', error);
        toastr.error('An error occurred during login.');
    }
});