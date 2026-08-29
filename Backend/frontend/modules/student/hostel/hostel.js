const StudentHostelModule = (function () {
    let currentStudentId = 0;

    async function init() {
        const profile = AuthService.getUserProfile();
        if (!profile) return;
        currentStudentId = profile.id;

        await loadHostelOptions();
        await loadMyApplications();
    }

    async function loadHostelOptions() {
        try {
            const data = await ApiService.get(ApiService.ROUTES.HOSTEL.SELECT_HOSTELS);
            const hostels = data.data || data || [];
            const selectEl = document.getElementById('select-hostels');
            selectEl.innerHTML = `<option value="">-- Select Preferred Hostel --</option>` +
                hostels.map(h => `<option value="${h.id}">${h.name}</option>`).join('');
        } catch (err) {
            ToastService.error("Failed to load hostel directory.");
        }
    }

    async function submitApplication(e) {
        e.preventDefault();
        const hostelId = parseInt(document.getElementById('select-hostels').value);
        const term = document.getElementById('input-semester').value.trim();
        const reqs = document.getElementById('input-requirements').value.trim();

        if (!hostelId) {
            ToastService.error("Please select a preferred hostel.");
            return;
        }

        try {
            const payload = {
                studentId: currentStudentId,
                preferredHostelId: hostelId,
                termSemester: term,
                specialRequirements: reqs
            };

            await ApiService.post(ApiService.ROUTES.HOSTEL.SUBMIT, payload);
            ToastService.success("Housing application submitted successfully!");

            document.getElementById('form-hostel-app').reset();
            document.getElementById('input-semester').value = "2026 / Semester 1";
            await loadMyApplications();
        } catch (err) {
            ToastService.error(err.message || "Failed to submit housing application.");
        }
    }

    async function loadMyApplications() {
        try {
            const data = await ApiService.get(ApiService.ROUTES.HOSTEL.STUDENT_APPS);
            const apps = data.data || data || [];
            const tbody = document.getElementById('student-hostel-tbody');

            if (apps.length === 0) {
                tbody.innerHTML = `<tr><td colspan="6" class="text-secondary" style="text-align: center;">No housing applications submitted yet.</td></tr>`;
                return;
            }

            tbody.innerHTML = apps.map(a => {
                const roomNum = a.roomNumber || a.RoomNumber || a.assignedRoom?.roomNumber || a.AssignedRoom?.RoomNumber;
                return `
                    <tr>
                        <td><strong>${a.preferredHostel?.name || a.PreferredHostel?.Name || a.hostelName || a.HostelName || 'Hostel'}</strong></td>
                        <td>${a.termSemester || a.TermSemester || ''}</td>
                        <td>${a.specialRequirements || 'None'}</td>
                        <td><span class="badge badge-${(a.status || 'Pending').toLowerCase()}">${a.status}</span></td>
                        <td>
                            ${roomNum 
                                ? `<span class="badge badge-approved">Room #${roomNum}</span>` 
                                : '<span class="text-secondary">Pending Allocation</span>'}
                        </td>
                        <td>${a.createdAt ? new Date(a.createdAt).toLocaleDateString() : ''}</td>
                    </tr>
                `;
            }).join('');
        } catch (err) {
            console.error("Failed to fetch student hostel applications:", err);
        }
    }

    return {
        init,
        submitApplication
    };
})();

document.addEventListener('DOMContentLoaded', StudentHostelModule.init);
