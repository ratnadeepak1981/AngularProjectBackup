/**
 * ==========================================================================
 * Campus Services Portal - Authentication & Session Service
 * Manages JWT tokens, user role state, and client-side page guards.
 * ==========================================================================
 */

const AuthService = (function () {
    function getPathToRoot() {
        const segments = window.location.pathname.split('/').filter(s => s.length > 0);
        const modulesIndex = segments.indexOf('modules');
        if (modulesIndex !== -1) {
            const stepsUp = segments.length - 1 - modulesIndex;
            return '../'.repeat(stepsUp);
        }
        return './';
    }

    function getToken() {
        return localStorage.getItem('token');
    }

    function getRole() {
        return localStorage.getItem('role');
    }

    function getUserProfile() {
        const raw = localStorage.getItem('user_profile');
        try {
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
    }

    function isAuthenticated() {
        return !!getToken();
    }

    function isAdmin() {
        return getRole() === 'Admin';
    }

    function saveSession(token, role, profile) {
        localStorage.setItem('token', token);
        localStorage.setItem('role', role);
        if (profile) {
            localStorage.setItem('user_profile', JSON.stringify(profile));
        }
    }

    function logout() {
        localStorage.clear();
        const pathToRoot = getPathToRoot();
        window.location.href = `${pathToRoot}modules/auth/login.html`;
    }

    function enforceAuthGuard(requiredRole = null) {
        const pathToRoot = getPathToRoot();
        if (!isAuthenticated()) {
            window.location.href = `${pathToRoot}modules/auth/login.html`;
            return false;
        }

        if (requiredRole && getRole() !== requiredRole) {
            if (typeof ToastService !== 'undefined') {
                ToastService.error('Access Denied. You do not have permission to view this resource.');
            }
            window.location.href = getRole() === 'Admin' 
                ? `${pathToRoot}modules/admin/dashboard/index.html`
                : `${pathToRoot}modules/student/dashboard/index.html`;
            return false;
        }

        return true;
    }

    return {
        getPathToRoot,
        getToken,
        getRole,
        getUserProfile,
        isAuthenticated,
        isAdmin,
        saveSession,
        logout,
        enforceAuthGuard
    };
})();
