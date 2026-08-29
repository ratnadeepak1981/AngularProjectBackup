const AdminComplaintModule = (function () {
    let currentTicketId = 0;

    async function init() {
        await loadTickets();
        await loadCategories();
    }

    async function loadTickets() {
        try {
            const data = await ApiService.get(ApiService.ROUTES.COMPLAINTS.ADMIN_LIST);
            const complaints = Array.isArray(data) ? data : (data && Array.isArray(data.data) ? data.data : []);
            const tbody = document.getElementById('complaints-triage-tbody');

            if (tickets.length === 0) {
                tbody.innerHTML = `<tr><td colspan="6" class="text-secondary" style="text-align: center;">No complaint tickets submitted.</td></tr>`;
                return;
            }

            tbody.innerHTML = tickets.map(t => `
                <tr>
                    <td><strong>${t.student?.indexNumber || t.Student?.IndexNumber || 'N/A'}</strong></td>
                    <td><span class="badge badge-approved">${t.category?.name || t.Category?.Name || 'General'}</span></td>
                    <td>${t.description}</td>
                    <td><span class="badge badge-${(t.status || 'Pending').toLowerCase().replace(' ', '')}">${t.status}</span></td>
                    <td>${t.resolutionNote || '<span class="text-secondary">Pending Staff Note</span>'}</td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="AdminComplaintModule.openResolveModal(${t.id}, '${t.status || 'In Progress'}', '${(t.resolutionNote || '').replace(/'/g, "\\'")}')">Edit Resolution →</button>
                    </td>
                </tr>
            `).join('');
        } catch (err) {
            console.error("Failed to load complaint tickets:", err);
        }
    }

    async function loadCategories() {
        try {
            const data = await ApiService.get(ApiService.ROUTES.COMPLAINTS.CATEGORIES);
            const complaints = Array.isArray(data) ? data : (data && Array.isArray(data.data) ? data.data : []);
            const tbody = document.getElementById('categories-tbody');

            if (categories.length === 0) {
                tbody.innerHTML = `<tr><td colspan="3" class="text-secondary" style="text-align: center;">No categories present.</td></tr>`;
                return;
            }

            tbody.innerHTML = categories.map(c => `
                <tr>
                    <td><strong>${c.name}</strong></td>
                    <td><span class="badge badge-${c.isActive ? 'approved' : 'rejected'}">${c.isActive ? 'Active' : 'Deactivated'}</span></td>
                    <td>
                        <button class="btn btn-sm btn-danger" onclick="AdminComplaintModule.deleteCategory(${c.id})">Deactivate Category</button>
                    </td>
                </tr>
            `).join('');
        } catch (err) {
            console.error("Failed to load complaint categories:", err);
        }
    }

    function openResolveModal(id, currentStatus, currentNote) {
        currentTicketId = id;
        document.getElementById('select-ticket-status').value = currentStatus === 'Pending' ? 'In Progress' : currentStatus;
        document.getElementById('input-resolution-note').value = currentNote;
        document.getElementById('modal-resolve-ticket').classList.add('active');
    }

    function closeResolveModal() { document.getElementById('modal-resolve-ticket').classList.remove('active'); }

    async function submitResolveTicket() {
        if (!currentTicketId) return;

        const status = document.getElementById('select-ticket-status').value;
        const note = document.getElementById('input-resolution-note').value.trim();

        try {
            await ApiService.put(ApiService.ROUTES.COMPLAINTS.UPDATE_STATUS(currentTicketId), {
                status: status,
                resolutionNote: note
            });

            ToastService.success("Ticket updated! Automated notification sent to student.");
            closeResolveModal();
            await loadTickets();
        } catch (err) {
            ToastService.error(err.message || "Failed to update ticket.");
        }
    }

    function openCreateCategoryModal() { document.getElementById('modal-create-category').classList.add('active'); }
    function closeCategoryModal() { document.getElementById('modal-create-category').classList.remove('active'); }

    async function submitCreateCategory() {
        const name = document.getElementById('input-category-name').value.trim();
        if (!name) return;

        try {
            await ApiService.post(ApiService.ROUTES.COMPLAINTS.CREATE_CATEGORY, { name: name });
            ToastService.success("Category created successfully.");
            closeCategoryModal();
            await loadCategories();
        } catch (err) {
            ToastService.error(err.message || "Failed to create category.");
        }
    }

    async function deleteCategory(id) {
        if (!confirm("Are you sure you want to soft-deactivate this category?")) return;

        try {
            await ApiService.delete(ApiService.ROUTES.COMPLAINTS.DELETE_CATEGORY(id));
            ToastService.success("Category deactivated.");
            await loadCategories();
        } catch (err) {
            ToastService.error(err.message || "Failed to deactivate category.");
        }
    }

    return {
        init,
        openResolveModal,
        closeResolveModal,
        submitResolveTicket,
        openCreateCategoryModal,
        closeCategoryModal,
        submitCreateCategory,
        deleteCategory
    };
})();

document.addEventListener('DOMContentLoaded', AdminComplaintModule.init);
