const StudentDashboardModule = (function () {
    let currentStudentId = 0;

    async function init() {
        const profile = AuthService.getUserProfile();
        if (!profile) return;
        currentStudentId = profile.id;

        await loadProfile();
        await loadDashboardMetrics();
    }

    async function loadProfile() {
        try {
            const data = await ApiService.get(ApiService.ROUTES.STUDENTS.GET_PROFILE(currentStudentId));
            const student = data.data || data;

            document.getElementById('student-index-badge').textContent = `Index: ${student.indexNumber || student.IndexNumber || 'N/A'}`;
            document.getElementById('profile-name').value = student.fullName || student.FullName || '';
            document.getElementById('profile-index').value = student.indexNumber || student.IndexNumber || '';
            document.getElementById('profile-faculty').value = student.faculty?.name || student.Faculty?.Name || 'Faculty of Applied Sciences';
            document.getElementById('profile-contact').value = student.contactDetails || student.ContactDetails || '';
        } catch (err) {
            console.error("Failed to load student profile:", err);
        }
    }

    async function saveProfile() {
        try {
            const contact = document.getElementById('profile-contact').value;
            const name = document.getElementById('profile-name').value;
            await ApiService.put(ApiService.ROUTES.STUDENTS.UPDATE_PROFILE(currentStudentId), {
                fullName: name,
                contactDetails: contact
            });
            ToastService.success("Profile contact details updated successfully.");
        } catch (err) {
            ToastService.error(err.message || "Failed to update profile.");
        }
    }

    async function loadDashboardMetrics() {
        try {
            // Hostel Status
            const hostelRes = await ApiService.get(ApiService.ROUTES.HOSTEL.STUDENT_APPS).catch(() => null);
            const hostelApps = hostelRes?.data || hostelRes || [];
            const latestHostel = Array.isArray(hostelApps) && hostelApps.length > 0 ? hostelApps[0] : null;
            
            const hostelEl = document.getElementById('metric-hostel-status');
            if (latestHostel) {
                hostelEl.textContent = latestHostel.status === 'RoomAssigned' 
                    ? `Assigned (${latestHostel.assignedRoom?.roomNumber || 'Room'})`
                    : latestHostel.status;
            } else {
                hostelEl.textContent = "No Application";
            }

            // Lab Bookings
            const labRes = await ApiService.get(ApiService.ROUTES.LABS.STUDENT_BOOKINGS(currentStudentId)).catch(() => null);
            const labBookings = labRes?.data || labRes || [];
            document.getElementById('metric-lab-bookings').textContent = `${Array.isArray(labBookings) ? labBookings.length : 0} Active`;

            // Billing Balance
            const ledgerRes = await ApiService.get(ApiService.ROUTES.BILLING.LEDGER).catch(() => null);
            const ledger = ledgerRes?.data || ledgerRes || [];
            let unpaidTotal = 0;
            if (Array.isArray(ledger)) {
                unpaidTotal = ledger.filter(item => item.status === 'Unpaid').reduce((sum, item) => sum + (item.amount || 0), 0);
            }
            document.getElementById('metric-fee-balance').textContent = `$${unpaidTotal.toFixed(2)}`;

            // Notifications
            const notifRes = await ApiService.get(ApiService.ROUTES.NOTIFICATIONS.STUDENT_FEED(currentStudentId)).catch(() => null);
            const notifs = notifRes?.data || notifRes || [];
            const activityListEl = document.getElementById('recent-activity-list');
            if (Array.isArray(notifs) && notifs.length > 0) {
                activityListEl.innerHTML = notifs.slice(0, 4).map(n => `
                    <div style="padding: 10px 0; border-bottom: 1px solid var(--border-light); font-size: 13px;">
                        <div style="font-weight: 600; color: var(--primary-navy);">${n.type || 'Notice'}</div>
                        <div style="color: var(--text-primary); margin-top: 2px;">${n.message || n.Message}</div>
                    </div>
                `).join('');
            } else {
                activityListEl.innerHTML = `<p class="text-secondary" style="font-size: 13px;">No recent activity notifications.</p>`;
            }

        } catch (err) {
            console.error("Failed to load metrics:", err);
        }
    }

    return {
        init,
        saveProfile
    };
})();

document.addEventListener('DOMContentLoaded', StudentDashboardModule.init);
