/**
 * ==========================================================================
 * Campus Services Portal - Centralized API Service (HTTP Client)
 * Single point of connection & REST API communication for all modules.
 * ==========================================================================
 */

// ⚙️ CENTRALIZED GLOBAL BACKEND CONFIGURATION
// Change BACKEND_URL below to set your ASP.NET Core backend URL globally for all modules!
// You can also override dynamically at runtime in browser console via:
// localStorage.setItem('API_BASE_URL', 'https://localhost:7089/api')
const CENTRAL_CONFIG = {
    DEFAULT_BACKEND_URL: 'https://localhost:7089/api' // 👈 CHANGE YOUR BACKEND PORT / URL HERE!
};

const ApiService = (function () {
    function resolveBaseUrl() {
        // 1. Check if user configured a custom URL in localStorage
        const customUrl = localStorage.getItem('API_BASE_URL');
        if (customUrl) return customUrl;

        const origin = window.location.origin;
        const port = window.location.port;

        // 2. If served directly by ASP.NET Core API server
        if (port === '7089' || port === '5000' || port === '5016') {
            return origin + '/api';
        }

        // 3. Fallback to Centralized Default Config
        return CENTRAL_CONFIG.DEFAULT_BACKEND_URL;
    }

    const BASE_URL = resolveBaseUrl();

    /**
     * Complete Master Catalog of all 64 REST API Route Endpoints
     */
    const ROUTES = {
        AUTH: {
            LOGIN: '/auth/login',
            VERIFY_EMAIL: '/auth/verify-email',
            RESEND_VERIFICATION: '/auth/resend-verification',
            FORGOT_PASSWORD: '/auth/forgot-password',
            RESET_PASSWORD: '/auth/reset-password',
            DEACTIVATE_CHECK: (id) => `/auth/deactivate-check/${id}`,
            DEACTIVATE: (id) => `/auth/deactivate/${id}`,
            REACTIVATE: (id) => `/auth/reactivate/${id}`
        },
        STUDENTS: {
            REGISTER: '/students/register',
            GET_PROFILE: (id) => `/students/${id}`,
            UPDATE_PROFILE: (id) => `/students/${id}`,
            DIRECTORY: '/students',
            DELETE: (id) => `/students/${id}`,
            MASTER_BY_INDEX: (idx) => `/student-master/${idx}`,
            MASTER_LIST: '/student-master',
            MASTER_IMPORT: '/student-master/import'
        },
        HOSTEL: {
            SELECT_HOSTELS: '/hostel-applications/hostels',
            SUBMIT: '/hostel-applications',
            STUDENT_APPS: '/hostel-applications/student',
            PENDING_APPS: '/hostel-applications/pending',
            UPDATE_STATUS: (id) => `/hostel-applications/${id}/status`,
            ASSIGN_ROOM: (id) => `/hostel-applications/${id}/assign-room`,
            HOSTELS: '/hostels',
            UPDATE_HOSTEL: (id) => `/hostels/${id}`,
            DELETE_HOSTEL: (id) => `/hostels/${id}`,
            ROOMS: (hostelId) => `/hostels/${hostelId}/rooms`,
            UPDATE_ROOM: (id) => `/rooms/${id}`,
            DELETE_ROOM: (id) => `/rooms/${id}`,
            ROOM_OCCUPANCY: (id) => `/rooms/${id}/occupancy`
        },
        LABS: {
            LIST: '/labs',
            CREATE: '/labs',
            ADD_SEAT: (labId) => `/labs/${labId}/seats`,
            DELETE_SEAT: (labId, seatId) => `/labs/${labId}/seats/${seatId}`,
            LAYOUT: (labId) => `/lab-bookings/layout/${labId}`,
            BOOK: '/lab-bookings',
            CONFIRM: (id) => `/lab-bookings/${id}/confirm`,
            CANCEL: (id) => `/lab-bookings/${id}`,
            STUDENT_BOOKINGS: (studentId) => `/lab-bookings/student/${studentId}`
        },
        EVENTS: {
            LIST: '/events',
            CREATE: '/events',
            UPDATE: (id) => `/events/${id}`,
            REGISTER: '/events/register',
            CANCEL: (id) => `/events/${id}/register`,
            REGISTRATIONS: (id) => `/events/${id}/registrations`,
            VENUES: '/venues',
            CREATE_VENUE: '/venues',
            UPDATE_VENUE: (id) => `/venues/${id}`,
            DELETE_VENUE: (id) => `/venues/${id}`,
            VENUE_AVAILABILITY: (id) => `/venues/${id}/availability`
        },
        COMPLAINTS: {
            CATEGORIES: '/complaint-categories',
            CREATE_CATEGORY: '/complaint-categories',
            UPDATE_CATEGORY: (id) => `/complaint-categories/${id}`,
            DELETE_CATEGORY: (id) => `/complaint-categories/${id}`,
            SUBMIT: '/complaints',
            STUDENT_LIST: '/complaints/student',
            ADMIN_LIST: '/complaints',
            UPDATE_STATUS: (id) => `/complaints/${id}/status`
        },
        CERTIFICATES: {
            TYPES: '/certificate-types',
            CREATE_TYPE: '/certificate-types',
            UPDATE_TYPE: (id) => `/certificate-types/${id}`,
            DELETE_TYPE: (id) => `/certificate-types/${id}`,
            SUBMIT: '/certificate-requests',
            STUDENT_LIST: '/certificate-requests/student',
            ADMIN_LIST: '/certificate-requests',
            UPDATE_STATUS: (id) => `/certificate-requests/${id}/status`
        },
        BILLING: {
            LEDGER: '/billing/ledger',
            PAY: (id) => `/billing/payments/${id}/pay`,
            FEE_TYPES: '/fee-types',
            CREATE_FEE_TYPE: '/fee-types',
            UPDATE_FEE_TYPE: (id) => `/fee-types/${id}`,
            DELETE_FEE_TYPE: (id) => `/fee-types/${id}`,
            ASSIGN_FEE: '/billing/fees/assign',
            ISSUE_FINE: '/billing/fines',
            UPDATE_UNPAID: (id) => `/billing/fee-payments/${id}`,
            CANCEL_UNPAID: (id) => `/billing/fee-payments/${id}`
        },
        NOTIFICATIONS: {
            STUDENT_FEED: (id) => `/notifications/student/${id}`,
            MARK_READ: (id) => `/notifications/${id}/read`,
            ADMIN_MONITOR: '/notifications'
        },
        FACULTIES: {
            LIST: '/faculties',
            CREATE: '/faculties',
            UPDATE: (id) => `/faculties/${id}`,
            DELETE: (id) => `/faculties/${id}`
        },
        SYSTEM: {
            HOLD_MINUTES: '/admin/system-settings/reservation-hold-minutes',
            PAGE_SIZE: '/admin/system-settings/default-page-size'
        }
    };

    /**
     * Executes an asynchronous HTTP Fetch request targeting ASP.NET Core port 7089 with JWT header.
     */
    async function request(endpoint, options = {}) {
        const token = localStorage.getItem('token');

        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const config = {
            method: options.method || 'GET',
            headers: headers,
            ...options
        };

        if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
            config.body = JSON.stringify(options.body);
        }

        if (options.body instanceof FormData) {
            delete config.headers['Content-Type'];
        }

        try {
            const response = await fetch(`${BASE_URL}${endpoint}`, config);

            if (response.status === 401) {
                console.warn('[ApiService] 401 Unauthorized received.');
                localStorage.removeItem('token');
                localStorage.removeItem('role');
                let pathToRoot = '../../../';
                if (typeof AuthService !== 'undefined' && AuthService.getPathToRoot) {
                    pathToRoot = AuthService.getPathToRoot();
                } else {
                    const segments = window.location.pathname.split('/').filter(s => s.length > 0);
                    const modulesIndex = segments.indexOf('modules');
                    if (modulesIndex !== -1) {
                        const stepsUp = segments.length - 1 - modulesIndex;
                        pathToRoot = '../'.repeat(stepsUp);
                    }
                }
                window.location.href = `${pathToRoot}modules/auth/login.html`;
                throw new Error('Invalid credentials or session expired. Please verify your details.');
            }

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                const errorMessage = data.message || data.Message || `HTTP Error ${response.status}: ${response.statusText}`;
                console.error(`[ApiService Error] ${config.method} ${endpoint}:`, errorMessage);
                throw new Error(errorMessage);
            }

            return data;
        } catch (error) {
            if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
                const netErr = `Backend Server Unreachable on ${BASE_URL}. Please launch ASP.NET Core backend ('dotnet run').`;
                
                if (typeof ToastService !== 'undefined') {
                    ToastService.error(netErr);
                } else {
                    console.error("[ApiService Critical Context Failure]:", netErr);
                }
                throw new Error(netErr);
            }
            throw error;
        }
    }

    async function checkHealth() {
        try {
            const res = await fetch(`${BASE_URL}/labs`, { method: 'GET' });
            return res.ok || res.status === 401;
        } catch (e) {
            return false;
        }
    }

    return {
        get: (endpoint) => request(endpoint, { method: 'GET' }),
        post: (endpoint, body) => request(endpoint, { method: 'POST', body }),
        put: (endpoint, body) => request(endpoint, { method: 'PUT', body }),
        delete: (endpoint) => request(endpoint, { method: 'DELETE' }),
        upload: (endpoint, formData) => request(endpoint, { method: 'POST', body: formData }),
        checkHealth,
        ROUTES,
        BASE_URL
    };
})();
