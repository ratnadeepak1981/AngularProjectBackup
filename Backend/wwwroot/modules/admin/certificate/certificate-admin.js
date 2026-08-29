//await ApiService.put(ApiService.ROUTES.HOSTEL.UPDATE_STATUS(id), { status: "Approved" });

const AdminCertificateModule = (function () {
    async function init() {
        await loadRequests();
        await loadTypes();
    }

    async function loadRequests() {
        try {
            const data = await ApiService.get(ApiService.ROUTES.CERTIFICATES.ADMIN_LIST);
            const requests = Array.isArray(data) ? data : (data && Array.isArray(data.data) ? data.data : []);
            const tbody = document.getElementById('certificates-admin-tbody');

            if (requests.length === 0) {
                tbody.innerHTML = `<tr><td colspan="6" class="text-secondary" style="text-align: center;">No certificate requests submitted.</td></tr>`;
                return;
            }

            tbody.innerHTML = requests.map(r => `
                <tr>
                    <td><strong>${r.student?.indexNumber || r.Student?.IndexNumber || 'N/A'}</strong></td>
                    <td><span class="badge badge-approved">${r.certificateType?.name || r.CertificateType?.Name || 'Document'}</span></td>
                    <td>${r.reason}</td>
                    <td><span class="badge badge-${(r.status || 'Pending').toLowerCase().replace(/\s+/g, '')}">${r.status}</span></td>
                    <td>${r.requestedAt ? new Date(r.requestedAt).toLocaleDateString() : ''}</td>
                    <td>
                        ${r.status === 'Pending' ? `
                            <button class="btn btn-sm btn-primary" onclick="AdminCertificateModule.updateStatus(${r.id}, 'Approved')">Approve</button>
                            <button class="btn btn-sm btn-danger" onclick="AdminCertificateModule.updateStatus(${r.id}, 'Rejected')">Reject</button>
                        ` : ''}
                        ${r.status === 'Approved' ? `
                            <button class="btn btn-sm btn-outline" onclick="AdminCertificateModule.updateStatus(${r.id}, 'Ready for Collection')">Mark Ready for Collection →</button>
                        ` : ''}
                    </td>
                </tr>
            `).join('');
        } catch (err) {
            console.error("Failed to load certificate requests:", err);
        }
    }

    async function updateStatus(id, newStatus) {
        try {
            await ApiService.put(ApiService.ROUTES.CERTIFICATES.UPDATE_STATUS(id), { Status: newStatus });
            ToastService.success(`Request status updated to ${newStatus}. Automated notification sent to student.`);
            await loadRequests();
        } catch (err) {
            ToastService.error(err.message || "Failed to update request status.");
        }
    }

    async function loadTypes() {
        try {
            const data = await ApiService.get(ApiService.ROUTES.CERTIFICATES.TYPES);
            //const requests = Array.isArray(data) ? data : (data && Array.isArray(data.data) ? data.data : []);
            const types = Array.isArray(data) ? data : (data && Array.isArray(data.data) ? data.data : []);
            const tbody = document.getElementById('types-tbody');

            if (types.length === 0) {
                tbody.innerHTML = `<tr><td colspan="3" class="text-secondary" style="text-align: center;">No certificate types present.</td></tr>`;
                return;
            }

            tbody.innerHTML = types.map(t => `
                <tr>
                    <td><strong>${t.name}</strong></td>
                    <td><span class="badge badge-${t.isActive ? 'approved' : 'rejected'}">${t.isActive ? 'Active' : 'Deactivated'}</span></td>
                    <td>
                        <button class="btn btn-sm btn-danger" onclick="AdminCertificateModule.deleteType(${t.id})">Deactivate Type</button>
                    </td>
                </tr>
            `).join('');
        } catch (err) {
            console.error("Failed to load certificate types:", err);
        }
    }

    function openCreateTypeModal() { document.getElementById('modal-create-type').classList.add('active'); }
    function closeTypeModal() { document.getElementById('modal-create-type').classList.remove('active'); }

    async function submitCreateType() {
        const name = document.getElementById('input-type-name').value.trim();
        if (!name) return;

        try {
            await ApiService.post(ApiService.ROUTES.CERTIFICATES.CREATE_TYPE, { Name: name });
            ToastService.success("Certificate type created successfully.");
            closeTypeModal();
            await loadTypes();
        } catch (err) {
            ToastService.error(err.message || "Failed to create type.");
        }
    }

    async function deleteType(id) {
        if (!confirm("Are you sure you want to soft-deactivate this certificate type?")) return;

        try {
            await ApiService.delete(ApiService.ROUTES.CERTIFICATES.DELETE_TYPE(id));
            ToastService.success("Certificate type deactivated.");
            await loadTypes();
        } catch (err) {
            ToastService.error(err.message || "Failed to deactivate type.");
        }
    }

    return {
        init,
        updateStatus,
        openCreateTypeModal,
        closeTypeModal,
        submitCreateType,
        deleteType
    };
})();

document.addEventListener('DOMContentLoaded', AdminCertificateModule.init);
