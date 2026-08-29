/**
 * Campus Services Portal - Authentication Controller
 * Manages event attachments, form bindings, and authentication REST workflows.
 */
const LoginModule = (function() {
    
    // Wire up event listeners cleanly on DOM load
    document.addEventListener('DOMContentLoaded', () => {
        const loginForm = document.getElementById('login-form');
        const forgotBtn = document.getElementById('btn-forgot-password');
        const closeModalBtn = document.getElementById('btn-close-modal');
        const requestTokenBtn = document.getElementById('btn-request-token');
        const submitResetBtn = document.getElementById('btn-submit-reset');

        if (loginForm) loginForm.addEventListener('submit', handleLogin);
        if (forgotBtn) forgotBtn.addEventListener('click', openForgotPasswordModal);
        if (closeModalBtn) closeModalBtn.addEventListener('click', closeForgotPasswordModal);
        if (requestTokenBtn) requestTokenBtn.addEventListener('click', requestResetToken);
        if (submitResetBtn) submitResetBtn.addEventListener('click', submitPasswordReset);
    });

    async function handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        const alertEl = document.getElementById('login-error-alert');
        if (alertEl) alertEl.style.display = 'none';

        try {
            const response = await ApiService.post('/auth/login', { email, password });
            const authData = response.data || response;

            AuthService.saveSession(authData.token, authData.role, authData.profile);

            if (authData.profile && typeof authData.profile === 'object' && authData.profile.id) 
            {
                localStorage.setItem('studentId', authData.profile.id);
            }
            else 
            {
                localStorage.removeItem('studentId');
            }

            ToastService.success('Authentication Successful! Redirecting...');

            setTimeout(() => {
                window.location.href = authData.role === 'Admin'
                    ? '../admin/dashboard/index.html'
                    : '../student/dashboard/index.html';
            }, 800);
        } catch (error) {
            const errorMsg = error.message || 'Invalid email address or password. Please verify your credentials and try again.';
            if (alertEl) {
                alertEl.textContent = errorMsg;
                alertEl.style.display = 'block';
            }
            ToastService.error(errorMsg);
        }
        return false;
    }

    function openForgotPasswordModal() {
        document.getElementById('forgot-password-modal').classList.add('active');
    }

    function closeForgotPasswordModal() {
        document.getElementById('forgot-password-modal').classList.remove('active');
    }

    async function requestResetToken() {
        const email = document.getElementById('reset-email').value;
        if (!email) return ToastService.error('Please enter an email address.');

        try {
            const res = await ApiService.post('/auth/forgot-password', { email });
            ToastService.success('Reset token generated! Copy token below.');
            
            const resData = res.data || res;
            if (resData && resData.token) {
                document.getElementById('reset-token').value = resData.token;
            }
            document.getElementById('reset-step-2').style.display = 'block';
        } catch (e) {
            ToastService.error(e.message);
        }
    }

    async function submitPasswordReset() {
        const token = document.getElementById('reset-token').value;
        const newPassword = document.getElementById('reset-new-password').value;

        if (!token || !newPassword) return ToastService.error('Please provide token and new password.');

        try {
            await ApiService.post('/auth/reset-password', { token, newPassword });
            ToastService.success('Password updated successfully! Please sign in.');
            closeForgotPasswordModal();
        } catch (e) {
            ToastService.error(e.message);
        }
    }

    return {
        handleLogin,
        openForgotPasswordModal,
        closeForgotPasswordModal,
        requestResetToken,
        submitPasswordReset
    };
})();
