const StudentCertificateModule = (function () {
    let currentStudentId = 0;

    async function init() {
        const profile = AuthService.getUserProfile();
        if (!profile) return;
        currentStudentId = profile.id;

        await loadTypes();
        await loadMyRequests();
    }

    async function loadTypes() {
        try {
            const data = await ApiService.get(ApiService.ROUTES.CERTIFICATES.TYPES);
            const types = data.data || data || [];
            const selectEl = document.getElementById('select-certificate-type');
            selectEl.innerHTML = `<option value="">-- Select Certificate Type --</option>` +
                types.map(t => `<option value="${t.id}">${t.name}</option>`).join('');
        } catch (err) {
            ToastService.error("Failed to load certificate types.");
        }
    }

    async function submitRequest(e) {
        e.preventDefault();
        const typeId = parseInt(document.getElementById('select-certificate-type').value);
        const reason = document.getElementById('input-reason').value.trim();

        if (!typeId) {
            ToastService.error("Please select a certificate type.");
            return;
        }

        try {
            await ApiService.post(ApiService.ROUTES.CERTIFICATES.SUBMIT, {
                studentId: currentStudentId,
                certificateTypeId: typeId,
                reason: reason
            });

            ToastService.success("Certificate request submitted successfully!");
            document.getElementById('form-certificate').reset();
            await loadMyRequests();
        } catch (err) {
            ToastService.error(err.message || "Failed to submit certificate request.");
        }
    }

    async function loadMyRequests() {
        try {
            const data = await ApiService.get(ApiService.ROUTES.CERTIFICATES.STUDENT_LIST);
            const requests = data.data || data || [];
            const tbody = document.getElementById('student-certificates-tbody');

            if (requests.length === 0) {
                tbody.innerHTML = `<tr><td colspan="4" class="text-secondary" style="text-align: center;">No certificate requests submitted yet.</td></tr>`;
                return;
            }

            tbody.innerHTML = requests.map(r => `
                <tr>
                    <td><strong>${r.certificateType?.name || r.CertificateType?.Name || 'Document'}</strong></td>
                    <td>${r.reason}</td>
                    <td><span class="badge badge-${(r.status || 'Pending').toLowerCase().replace(/\s+/g, '')}">${r.status}</span></td>
                    <td>${r.requestedAt ? new Date(r.requestedAt).toLocaleDateString() : ''}</td>
                </tr>
            `).join('');
        } catch (err) {
            console.error("Failed to load student certificate requests:", err);
        }
    }

    return {
        init,
        submitRequest
    };
})();

document.addEventListener('DOMContentLoaded', StudentCertificateModule.init);
