const AdminNotificationsModule = (function () {
    let rawNotifications = [];

    async function init() {
        await loadAuditLog();
    }

    async function loadAuditLog() {
        try {
            const data = await ApiService.get(ApiService.ROUTES.NOTIFICATIONS.ADMIN_MONITOR);
            rawNotifications = Array.isArray(data) ? data : (data && Array.isArray(data.data) ? data.data : []);
            renderLog(rawNotifications);
        } catch (err) {
            console.error("Failed to load notifications audit log:", err);
        }
    }

    function renderLog(list) {
        const tbody = document.getElementById('notif-audit-tbody');

        if (list.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="text-secondary" style="text-align: center;">No dispatched notifications recorded.</td></tr>`;
            return;
        }

        tbody.innerHTML = list.map(n => `
            <tr>
                <td><strong>Student #${n.studentId}</strong></td>
                <td><span class="badge badge-approved">${n.type}</span></td>
                <td>${n.message}</td>
                <td><span class="badge badge-${n.isRead ? 'approved' : 'held'}">${n.isRead ? 'Read' : 'Unread / Dispatched'}</span></td>
                <td>${n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}</td>
            </tr>
        `).join('');
    }

    function filterLog() {
        const q = document.getElementById('input-search-notif').value.toLowerCase();
        if (!q) {
            renderLog(rawNotifications);
            return;
        }
        renderLog(rawNotifications.filter(n => 
            (n.type || '').toLowerCase().includes(q) || 
            (n.message || '').toLowerCase().includes(q) ||
            String(n.studentId).includes(q)
        ));
    }

    return {
        init,
        filterLog
    };
})();

document.addEventListener('DOMContentLoaded', AdminNotificationsModule.init);
