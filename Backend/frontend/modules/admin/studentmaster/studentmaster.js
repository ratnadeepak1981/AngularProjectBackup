const AdminStudentMasterModule = (function () {
    async function init() {
        await loadMasterList();
    }

    async function loadMasterList() {
        try {
            const data = await ApiService.get(ApiService.ROUTES.STUDENTS.MASTER_LIST);
            const master = Array.isArray(data) ? data : (data && Array.isArray(data.data) ? data.data : []);
            const tbody = document.getElementById('master-tbody');

            if (master.length === 0) {
                tbody.innerHTML = `<tr><td colspan="4" class="text-secondary" style="text-align: center;">No master intake records present.</td></tr>`;
                return;
            }

            tbody.innerHTML = master.map(m => `
                <tr>
                    <td><strong>${m.indexNumber || m.IndexNumber}</strong></td>
                    <td>${m.fullName || m.FullName}</td>
                    <td>Faculty #${m.facultyId || m.FacultyId}</td>
                    <td><span class="badge badge-${m.isUsed || m.IsUsed ? 'approved' : 'held'}">${m.isUsed || m.IsUsed ? 'Account Registered' : 'Pending Registration'}</span></td>
                </tr>
            `).join('');
        } catch (err) {
            console.error("Failed to load master intake list:", err);
        }
    }

    function openImportModal() { document.getElementById('modal-import-csv').classList.add('active'); }
    function closeImportModal() { document.getElementById('modal-import-csv').classList.remove('active'); }

    async function submitImportCSV() {
        const fileInput = document.getElementById('input-csv-file');
        if (!fileInput.files || fileInput.files.length === 0) {
            ToastService.error("Please select a CSV file to upload.");
            return;
        }

        const formData = new FormData();
        formData.append('file', fileInput.files[0]);

        try {
            await ApiService.upload(ApiService.ROUTES.STUDENTS.MASTER_IMPORT, formData);
            ToastService.success("Master CSV intake list imported successfully!");
            closeImportModal();
            await loadMasterList();
        } catch (err) {
            ToastService.error(err.message || "Failed to import CSV file.");
        }
    }

    return {
        init,
        openImportModal,
        closeImportModal,
        submitImportCSV
    };
})();

document.addEventListener('DOMContentLoaded', AdminStudentMasterModule.init);
