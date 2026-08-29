const AdminDashboardModule = (function () {
    async function init() {
        await loadAnalytics();
        await loadSystemSettings();
    }

    async function loadAnalytics() {
        try {
            const hostelRes = await ApiService.get(ApiService.ROUTES.HOSTEL.PENDING_APPS).catch(() => null);
            const pendingHostels = hostelRes?.data || hostelRes || [];
            document.getElementById('stat-pending-hostels').textContent = Array.isArray(pendingHostels) ? pendingHostels.length : 0;

            const complaintsRes = await ApiService.get(ApiService.ROUTES.COMPLAINTS.ADMIN_LIST).catch(() => null);
            const complaints = complaintsRes?.data || complaintsRes || [];
            const pendingComplaints = Array.isArray(complaints) ? complaints.filter(c => c.status === 'Pending') : [];
            document.getElementById('stat-pending-complaints').textContent = pendingComplaints.length;

            const certsRes = await ApiService.get(ApiService.ROUTES.CERTIFICATES.ADMIN_LIST).catch(() => null);
            const certs = certsRes?.data || certsRes || [];
            const pendingCerts = Array.isArray(certs) ? certs.filter(c => c.status === 'Pending') : [];
            document.getElementById('stat-pending-certificates').textContent = pendingCerts.length;

            const studentsRes = await ApiService.get(ApiService.ROUTES.STUDENTS.DIRECTORY).catch(() => null);
            const students = studentsRes?.data || studentsRes || [];
            document.getElementById('stat-total-students').textContent = Array.isArray(students) ? students.length : 0;

        } catch (err) {
            console.error("Failed to load admin analytics:", err);
        }
    }

    async function loadSystemSettings() {
        try {
            const holdRes = await ApiService.get(ApiService.ROUTES.SYSTEM.HOLD_MINUTES).catch(() => null);
            if (holdRes) {
                const mins = holdRes.data?.holdMinutes || holdRes.data?.HoldMinutes || 15;
                document.getElementById('input-hold-minutes').value = mins;
            }

            const sizeRes = await ApiService.get(ApiService.ROUTES.SYSTEM.PAGE_SIZE).catch(() => null);
            if (sizeRes) {
                const size = sizeRes.data?.pageSize || sizeRes.data?.PageSize || 10;
                document.getElementById('select-default-page-size').value = size;
            }
        } catch (err) {
            console.error("Failed to load system settings:", err);
        }
    }

    async function saveHoldMinutes() {
        const mins = parseInt(document.getElementById('input-hold-minutes').value);
        if (mins <= 0) {
            ToastService.error("Hold duration must be at least 1 minute.");
            return;
        }

        try {
            await ApiService.put(ApiService.ROUTES.SYSTEM.HOLD_MINUTES, { holdMinutes: mins });
            ToastService.success(`Reservation hold timeout updated to ${mins} minutes.`);
        } catch (err) {
            ToastService.error(err.message || "Failed to update hold timeout.");
        }
    }

    async function savePageSize() {
        const size = parseInt(document.getElementById('select-default-page-size').value);

        try {
            await ApiService.put(ApiService.ROUTES.SYSTEM.PAGE_SIZE, { pageSize: size });
            ToastService.success(`System default page size updated to ${size} records per page.`);
        } catch (err) {
            ToastService.error(err.message || "Failed to update default page size.");
        }
    }

    return {
        init,
        saveHoldMinutes,
        savePageSize
    };
})();

document.addEventListener('DOMContentLoaded', AdminDashboardModule.init);
