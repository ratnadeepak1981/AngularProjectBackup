const AdminFacultiesModule = (function () {
    async function init() {
        await loadFaculties();
    }

    async function loadFaculties() {
        try {
            const data = await ApiService.get(ApiService.ROUTES.FACULTIES.LIST);
            const faculties = Array.isArray(data) ? data : (data && Array.isArray(data.data) ? data.data : []);
            const tbody = document.getElementById('faculties-tbody');

            if (faculties.length === 0) {
                tbody.innerHTML = `<tr><td colspan="3" class="text-secondary" style="text-align: center;">No faculties configured.</td></tr>`;
                return;
            }

            tbody.innerHTML = faculties.map(f => `
                <tr>
                    <td><strong>${f.name}</strong></td>
                    <td><span class="badge badge-${f.isActive ? 'approved' : 'rejected'}">${f.isActive ? 'Active' : 'Deactivated'}</span></td>
                    <td>
                        <button class="btn btn-sm btn-danger" onclick="AdminFacultiesModule.deleteFaculty(${f.id})">Deactivate Faculty</button>
                    </td>
                </tr>
            `).join('');
        } catch (err) {
            console.error("Failed to load faculties:", err);
        }
    }

    function openCreateFacultyModal() { document.getElementById('modal-create-faculty').classList.add('active'); }
    function closeFacultyModal() { document.getElementById('modal-create-faculty').classList.remove('active'); }

    async function submitCreateFaculty() {
        const name = document.getElementById('input-faculty-name').value.trim();
        if (!name) return;

        try {
            await ApiService.post(ApiService.ROUTES.FACULTIES.CREATE, { name: name });
            ToastService.success("Faculty created successfully.");
            closeFacultyModal();
            await loadFaculties();
        } catch (err) {
            ToastService.error(err.message || "Failed to create faculty.");
        }
    }

    async function deleteFaculty(id) {
        if (!confirm("Are you sure you want to soft-deactivate this faculty?")) return;

        try {
            await ApiService.delete(ApiService.ROUTES.FACULTIES.DELETE(id));
            ToastService.success("Faculty deactivated.");
            await loadFaculties();
        } catch (err) {
            ToastService.error(err.message || "Failed to deactivate faculty.");
        }
    }

    return {
        init,
        openCreateFacultyModal,
        closeFacultyModal,
        submitCreateFaculty,
        deleteFaculty
    };
})();

document.addEventListener('DOMContentLoaded', AdminFacultiesModule.init);
