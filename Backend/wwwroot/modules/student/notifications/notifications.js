const StudentNotificationsModule = (function () {
    let currentStudentId = 0;
    let rawNotifications = [];

    async function init() {
        const profile = AuthService.getUserProfile();
        if (!profile) return;
        currentStudentId = profile.id;

        await loadNotifications();
    }

    async function loadNotifications() {
        try {
            const data = await ApiService.get(ApiService.ROUTES.NOTIFICATIONS.STUDENT_FEED(currentStudentId));
            rawNotifications = data.data || data || [];
            renderFeed(rawNotifications);
        } catch (err) {
            console.error("Failed to load notifications:", err);
        }
    }

    function renderFeed(list) {
        const container = document.getElementById('notifications-feed-container');

        if (list.length === 0) {
            container.innerHTML = `<p class="text-secondary" style="text-align: center; padding: 20px;">No notifications present in your feed.</p>`;
            return;
        }

        container.innerHTML = list.map(n => `
            <div class="notification-item ${n.isRead ? 'read' : 'unread'}" style="padding: 16px; border-bottom: 1px solid var(--border-light); display: flex; justify-content: space-between; align-items: center; background: ${n.isRead ? 'transparent' : 'var(--primary-light-blue)'};">
                <div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <strong style="color: var(--primary-navy); font-size: 14px;">${n.type}</strong>
                        ${!n.isRead ? `<span class="badge badge-held" style="font-size: 9px;">NEW</span>` : ''}
                    </div>
                    <p style="margin: 4px 0 0; font-size: 13px; color: var(--text-primary);">${n.message}</p>
                    <small class="text-secondary">${n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}</small>
                </div>
                <div>
                    ${!n.isRead ? `<button class="btn btn-sm btn-outline" onclick="StudentNotificationsModule.markAsRead(${n.id})">Mark Read</button>` : '<span class="text-secondary" style="font-size: 12px;">Read</span>'}
                </div>
            </div>
        `).join('');
    }

    function filterFeed(mode) {
        if (mode === 'unread') {
            renderFeed(rawNotifications.filter(n => !n.isRead));
        } else {
            renderFeed(rawNotifications);
        }
    }

    async function markAsRead(id) {
        try {
            await ApiService.put(ApiService.ROUTES.NOTIFICATIONS.MARK_READ(id));
            ToastService.success("Notification marked as read.");
            await loadNotifications();
        } catch (err) {
            ToastService.error(err.message || "Failed to update notification.");
        }
    }

    return {
        init,
        filterFeed,
        markAsRead
    };
})();

document.addEventListener('DOMContentLoaded', StudentNotificationsModule.init);
