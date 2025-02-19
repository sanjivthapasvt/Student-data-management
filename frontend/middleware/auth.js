const authService = require('../services/auth');

function checkAuth() {
    if (!authService.isAuthenticated()) {
        window.location.href = 'sign-in.html';
        return false;
    }
    return true;
}

module.exports = checkAuth;