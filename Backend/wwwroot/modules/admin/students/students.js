const AdminStudentsModule = (function () {
    let studentIdToDeactivate = 0;

    async function init() {
        await loadStudents();
    }

    async function loadStudents() {
        try {
            const data = await ApiService.get(ApiService.ROUTES.STUDENTS.DIRECTORY);
            const students = Array.isArray(data) ? data : (data && Array.isArray(data.data) ? data.data : []);
            const tbody = document.getElementById('students-directory-tbody');

            if (students.length === 0) {
                tbody.innerHTML = `<tr><td colspan="7" class="text-secondary" style="text-align: center;">No registered student accounts found.</td></tr>`;
                return;
            }

            tbody.innerHTML = students.map(s => {
                const isActive = s.user ? s.user.isActive : s.IsActive !== false;
                return `
                    <tr>
                        <td><strong>${s.indexNumber}</strong></td>
                        <td>${s.fullName}</td>
                        <td>${s.user?.email || 'N/A'}</td>
                        <td>${s.faculty?.name || 'Applied Sciences'}</td>
                        <td><span class="badge badge-${s.emailVerified ? 'approved' : 'held'}">${s.emailVerified ? 'Verified' : 'Pending Verification'}</span></td>
                        <td><span class="badge badge-${isActive ? 'approved' : 'rejected'}">${isActive ? 'Active' : 'Deactivated'}</span></td>
                        <td>
                            ${isActive ? `
                                <button class="btn btn-sm btn-danger" onclick="AdminStudentsModule.openSafetyCheckModal(${s.id || s.Id}, '${(s.fullName || s.FullName || '').replace(/'/g, "\\'")}')">Deactivate Account</button>
                            ` : `
                                <button class="btn btn-sm btn-primary" onclick="AdminStudentsModule.reactivateAccount(${s.id})">Reactivate Account</button>
                            `}
                        </td>
                    </tr>
                `;
            }).join('');
        } catch (err) {
            console.error("Failed to load student directory:", err);
        }
    }

    async function openSafetyCheckModal(id, fullName) {
        studentIdToDeactivate = id;
        document.getElementById('safety-student-name').textContent = `Safety Deactivation Audit for: ${fullName}`;
        const detailsEl = document.getElementById('safety-check-details');
        const confirmBtn = document.getElementById('btn-confirm-deactivate');

        detailsEl.innerHTML = `Checking active records across Hostel, Lab Bookings, Events, Complaints, Certificates, and Fee Payments...`;
        document.getElementById('modal-deactivate-check').classList.add('active');

        try {
            const checkData = await ApiService.get(ApiService.ROUTES.AUTH.DEACTIVATE_CHECK(id));
            const check = checkData.data || checkData;

            if (check.canDeactivate || check.CanDeactivate) {
                detailsEl.innerHTML = `<span style="color: green; font-weight: 700;">✅ Safety Check Passed:</span> No active dependencies block deactivation.`;
                confirmBtn.disabled = false;
            } else {
                detailsEl.innerHTML = `
                    <span style="color: red; font-weight: 700;">⚠️ Safety Rejection:</span> Cannot deactivate student profile.
                    <br>Active Dependencies Found: ${check.reasons?.join(', ') || check.Reasons?.join(', ') || 'Active records present'}
                `;
                confirmBtn.disabled = true;
            }
        } catch (err) {
            detailsEl.innerHTML = `<span style="color: red;">Failed to execute safety check.</span>`;
            confirmBtn.disabled = true;
        }
    }

    function closeSafetyModal() { document.getElementById('modal-deactivate-check').classList.remove('active'); }

    async function confirmDeactivation() {
        if (!studentIdToDeactivate) return;

        try {
            await ApiService.post(ApiService.ROUTES.AUTH.DEACTIVATE(studentIdToDeactivate));
            ToastService.success("Student account soft-deactivated successfully.");
            closeSafetyModal();
            await loadStudents();
        } catch (err) {
            ToastService.error(err.message || "Deactivation failed.");
        }
    }

    async function reactivateAccount(id) {
        try {
            await ApiService.post(ApiService.ROUTES.AUTH.REACTIVATE(id));
            ToastService.success("Student account reactivated.");
            await loadStudents();
        } catch (err) {
            ToastService.error(err.message || "Reactivation failed.");
        }
    }

    return {
        init,
        openSafetyCheckModal,
        closeSafetyModal,
        confirmDeactivation,
        reactivateAccount
    };
})();

document.addEventListener('DOMContentLoaded', AdminStudentsModule.init);
