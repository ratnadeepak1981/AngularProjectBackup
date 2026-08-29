/**
 * ==========================================================================
 * Campus Services Portal - Master App Orchestrator & Layout Injector
 * Handles dynamic header/sidebar injection, route guards, connection pings.
 * ==========================================================================
 */

function getPathToRoot() {
    const segments = window.location.pathname.split('/').filter(s => s.length > 0);
    const modulesIndex = segments.indexOf('modules');
    if (modulesIndex !== -1) {
        const stepsUp = segments.length - 1 - modulesIndex;
        return '../'.repeat(stepsUp);
    }
    return './';
}

async function loadCommonLayout() {
    try {
        const pathToRoot = getPathToRoot();

        // Load Header Fragment
        const headerEl = document.querySelector('header');
        if (headerEl) {
            const res = await fetch(`${pathToRoot}shared/header.html`);
            headerEl.innerHTML = await res.text();
            populateHeaderUserInfo();
        }

        // Load Sidebar Fragment
        const sidebarEl = document.querySelector('aside');
        if (sidebarEl) {
            const res = await fetch(`${pathToRoot}shared/sidebar.html`);
            sidebarEl.innerHTML = await res.text();
            renderSidebarMenu(pathToRoot);
        }

        // Load Footer Fragment
        const footerEl = document.querySelector('footer');
        if (footerEl) {
            const res = await fetch(`${pathToRoot}shared/footer.html`);
            footerEl.innerHTML = await res.text();
        }

        // Initialize connection status polling
        startConnectionHealthCheck();

    } catch (err) {
        console.error("Failed to inject semantic layout elements:", err);
    }
}

function populateHeaderUserInfo() {
    const profile = AuthService.getUserProfile();
    const role = AuthService.getRole();

    const nameEl = document.getElementById('user-display-name');
    const roleEl = document.getElementById('user-display-role');
    const initialsEl = document.getElementById('user-avatar-initials');

    if (nameEl && profile) nameEl.textContent = profile.name || profile.fullName || 'User Account';
    if (roleEl && role) roleEl.textContent = role === 'Admin' ? 'Administrator' : 'Student Account';
    if (initialsEl && profile && (profile.name || profile.fullName)) {
        const fullName = profile.name || profile.fullName;
        initialsEl.textContent = fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    }
}

function renderSidebarMenu(pathToRoot) {
    const menuList = document.getElementById('sidebar-menu-list');
    if (!menuList) return;

    const role = AuthService.getRole() || 'Student';

    let links = [];

    if (role === 'Admin') {
        links = [
            { label: 'Admin Dashboard', path: 'modules/admin/dashboard/index.html', icon: '📊' },
            { label: 'Student Master Intake', path: 'modules/admin/studentmaster/index.html', icon: '📋' },
            { label: 'Student Accounts', path: 'modules/admin/students/index.html', icon: '👥' },
            { label: 'Hostels & Rooms', path: 'modules/admin/hostel/index.html', icon: '🏢' },
            { label: 'Lab & Seat Builder', path: 'modules/admin/labbooking/index.html', icon: '💻' },
            { label: 'Events & Venues', path: 'modules/admin/events/index.html', icon: '📅' },
            { label: 'Complaint Triage', path: 'modules/admin/complaint/index.html', icon: '📝' },
            { label: 'Certificate Approvals', path: 'modules/admin/certificate/index.html', icon: '📜' },
            { label: 'Fees & Fine Management', path: 'modules/admin/billing/index.html', icon: '💳' },
            { label: 'Notification Monitor', path: 'modules/admin/notifications/index.html', icon: '📡' },
            { label: 'Faculties Master', path: 'modules/admin/faculties/index.html', icon: '🏛️' }
        ];
    } else {
        links = [
            { label: 'Student Dashboard', path: 'modules/student/dashboard/index.html', icon: '🏠' },
            { label: 'Hostel Accommodation', path: 'modules/student/hostel/index.html', icon: '🏢' },
            { label: 'Lab Seat Booking', path: 'modules/student/labbooking/index.html', icon: '💻' },
            { label: 'Campus Events', path: 'modules/student/events/index.html', icon: '📅' },
            { label: 'Tuition & Fee Ledger', path: 'modules/student/billing/index.html', icon: '💳' },
            { label: 'Submit Complaint', path: 'modules/student/complaint/index.html', icon: '📝' },
            { label: 'Request Certificate', path: 'modules/student/certificate/index.html', icon: '📜' },
            { label: 'Activity Notifications', path: 'modules/student/notifications/index.html', icon: '🔔' }
        ];
    }

    const currentPath = window.location.pathname;

    menuList.innerHTML = links.map(link => {
        const fullHref = `${pathToRoot}${link.path}`;
        const isActive = currentPath.includes(link.path);
        
        const isNotifLink = link.path.includes('notifications.html');
        const badgeElement = isNotifLink 
            ? `<span id="sidebar-notif-bubble" style="background: #EF4444; color: white; border-radius: 9999px; padding: 2px 7px; font-size: 10px; font-weight: 700; margin-left: auto; display: none; line-height: 1;">0</span>` 
            : '';

        return `
            <li>
                <a href="${fullHref}" class="nav-link ${isActive ? 'active' : ''}" style="display: flex; align-items: center; width: 100%;">
                    <span class="icon">${link.icon}</span>
                    <span>${link.label}</span>
                    ${badgeElement}
                </a>
            </li>
        `;
    }).join('');
}

function startConnectionHealthCheck() {
    setInterval(async () => {
        const isHealthy = await ApiService.checkHealth();
        const badge = document.getElementById('connection-status');
        const text = document.getElementById('connection-text');

        if (badge && text) {
            if (isHealthy) {
                badge.className = 'connection-badge online';
                text.textContent = 'Backend Connected';
            } else {
                badge.className = 'connection-badge offline';
                text.textContent = 'Backend Disconnected';
            }
        }
    }, 15000);
}

document.addEventListener('DOMContentLoaded', loadCommonLayout);
