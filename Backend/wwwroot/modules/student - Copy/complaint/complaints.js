const StudentComplaintModule = (function () {
    let currentStudentId = 0;

    async function init() {
        const profile = AuthService.getUserProfile();
        if (!profile) return;
        currentStudentId = profile.id;

        await loadCategories();
        await loadMyComplaints();
    }

    async function loadCategories() {
        try {
            const data = await ApiService.get(ApiService.ROUTES.COMPLAINTS.CATEGORIES);
            const categories = data.data || data || [];
            const selectEl = document.getElementById('select-category');
            selectEl.innerHTML = `<option value="">-- Select Category --</option>` +
                categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
        } catch (err) {
            ToastService.error("Failed to load complaint categories.");
        }
    }

    async function submitComplaint(e) {
        e.preventDefault();
        const categoryId = parseInt(document.getElementById('select-category').value);
        const description = document.getElementById('input-description').value.trim();

        if (!categoryId) {
            ToastService.error("Please select a complaint category.");
            return;
        }

        try {
            await ApiService.post(ApiService.ROUTES.COMPLAINTS.SUBMIT, {
                studentId: currentStudentId,
                categoryId: categoryId,
                description: description
            });

            ToastService.success("Complaint ticket submitted successfully!");
            document.getElementById('form-complaint').reset();
            await loadMyComplaints();
        } catch (err) {
            ToastService.error(err.message || "Failed to submit complaint.");
        }
    }

    async function loadMyComplaints() {
        try {
            const data = await ApiService.get(ApiService.ROUTES.COMPLAINTS.STUDENT_LIST);
            const complaints = data.data || data || [];
            const tbody = document.getElementById('student-complaints-tbody');

            if (complaints.length === 0) {
                tbody.innerHTML = `<tr><td colspan="5" class="text-secondary" style="text-align: center;">No complaint tickets submitted.</td></tr>`;
                return;
            }

            tbody.innerHTML = complaints.map(c => `
                <tr>
                    <td><strong>${c.category?.name || c.Category?.Name || 'General'}</strong></td>
                    <td>${c.description}</td>
                    <td><span class="badge badge-${(c.status || 'Pending').toLowerCase().replace(' ', '')}">${c.status}</span></td>
                    <td>${c.resolutionNote || '<span class="text-secondary">Pending Staff Review</span>'}</td>
                    <td>${c.createdAt ? new Date(c.createdAt).toLocaleDateString() : ''}</td>
                </tr>
            `).join('');
        } catch (err) {
            console.error("Failed to load student complaints:", err);
        }
    }

    return {
        init,
        submitComplaint
    };
})();

document.addEventListener('DOMContentLoaded', StudentComplaintModule.init);
