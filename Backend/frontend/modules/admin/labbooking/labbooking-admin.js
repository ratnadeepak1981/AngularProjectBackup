const AdminLabModule = (function () {
    let activeSelectedLabId = 0;
    let activeLabType = 'Computer';
    let labsList = [];

    async function init() {
        await loadLabs();
    }

    async function loadLabs() {
        try {
            const data = await ApiService.get(ApiService.ROUTES.LABS.LIST);
            labsList = Array.isArray(data) ? data : (data && Array.isArray(data.data) ? data.data : []);
            const tbody = document.getElementById('labs-directory-tbody');

            if (labsList.length === 0) {
                tbody.innerHTML = `<tr><td colspan="5" class="text-secondary" style="text-align: center;">No campus laboratories configured.</td></tr>`;
                return;
            }

            tbody.innerHTML = labsList.map(l => `
                <tr>
                    <td><strong>${l.name}</strong></td>
                    <td><span class="badge badge-approved">${l.labType} Lab</span></td>
                    <td>${l.capacity} Students</td>
                    <td>${(l.seats || []).length} Seats Built</td>
                    <td>
                        <button class="btn btn-sm btn-outline" onclick="AdminLabModule.inspectLab(${l.id}, '${l.name}', '${l.labType}')">Inspect Layout →</button>
                    </td>
                </tr>
            `).join('');
        } catch (err) {
            console.error("Failed to load labs directory:", err);
        }
    }

    async function inspectLab(labId, labName, labType) {
        activeSelectedLabId = labId;
        activeLabType = labType;

        document.getElementById('inspector-lab-title').textContent = `Workstation Seat Map: ${labName}`;
        const addBtn = document.getElementById('btn-add-seat');
        addBtn.style.display = labType === 'Computer' ? 'inline-flex' : 'none';

        const wrapper = document.getElementById('admin-seat-grid-container');
        wrapper.innerHTML = `<p class="text-secondary" style="text-align: center; padding: 20px;">Loading seat map layout...</p>`;

        try {
            const today = new Date().toISOString().split('T')[0];
            const layoutData = await ApiService.get(`${ApiService.ROUTES.LABS.LAYOUT(labId)}?date=${today}&timeSlot=09%3A00%20-%2011%3A00%20AM`);
            const layout = layoutData.data || layoutData;

            if (labType === 'Science') {
                wrapper.innerHTML = `
                    <div style="text-align: center; padding: 20px;">
                        <h4 style="color: var(--primary-navy);">🧪 Science Laboratory Bench Slot</h4>
                        <p class="text-secondary">Science labs support batch capacity reservations up to ${layout.capacity || 20} students.</p>
                    </div>
                `;
                return;
            }

            const seats = layout.seats || layout.Seats || [];
            if (seats.length === 0) {
                wrapper.innerHTML = `
                    <div style="text-align: center; padding: 20px;">
                        <p class="text-secondary">No workstation seats configured for this lab yet.</p>
                        <button class="btn btn-sm btn-primary" style="margin-top: 10px;" onclick="AdminLabModule.addSeatToSelectedLab()">+ Add First Workstation Seat</button>
                    </div>
                `;
                return;
            }

            wrapper.innerHTML = `
                <div class="seat-grid">
                    ${seats.map(s => `
                        <div class="seat-node ${(s.status || 'Available').toLowerCase()}" style="position: relative;">
                            <span class="seat-icon">💻</span>
                            <span>Seat #${s.seatNumber}</span>
                            <button onclick="AdminLabModule.deleteSeat(${s.id})" style="position: absolute; top: 2px; right: 2px; background: none; border: none; font-size: 10px; color: red; cursor: pointer;">✕</button>
                        </div>
                    `).join('')}
                </div>
            `;
        } catch (err) {
            wrapper.innerHTML = `<p class="text-danger" style="text-align: center; padding: 20px;">Failed to fetch seat layout.</p>`;
        }
    }

    async function addSeatToSelectedLab() {
        if (!activeSelectedLabId) return;

        try {
            const currentSeatsCount = (labsList.find(l => l.id === activeSelectedLabId)?.seats || []).length;
            const nextSeatNum = `${currentSeatsCount + 1}`;

            await ApiService.post(ApiService.ROUTES.LABS.ADD_SEAT(activeSelectedLabId), {
                seatNumber: nextSeatNum
            });

            ToastService.success(`Workstation Seat #${nextSeatNum} added.`);
            await loadLabs();
            const activeLab = labsList.find(l => l.id === activeSelectedLabId);
            if (activeLab) await inspectLab(activeLab.id, activeLab.name, activeLab.labType);
        } catch (err) {
            ToastService.error(err.message || "Failed to add seat.");
        }
    }

    async function deleteSeat(seatId) {
        if (!confirm("Are you sure you want to deactivate this seat?")) return;

        try {
            await ApiService.delete(ApiService.ROUTES.LABS.DELETE_SEAT(activeSelectedLabId, seatId));
            ToastService.success("Workstation seat deactivated.");
            await loadLabs();
            const activeLab = labsList.find(l => l.id === activeSelectedLabId);
            if (activeLab) await inspectLab(activeLab.id, activeLab.name, activeLab.labType);
        } catch (err) {
            ToastService.error(err.message || "Failed to deactivate seat.");
        }
    }

    function openCreateLabModal() { document.getElementById('modal-create-lab').classList.add('active'); }
    function closeLabModal() { document.getElementById('modal-create-lab').classList.remove('active'); }

    async function submitCreateLab() {
        const name = document.getElementById('input-lab-name').value.trim();
        const type = document.getElementById('select-lab-type').value;
        const cap = parseInt(document.getElementById('input-lab-capacity').value);

        if (!name || cap <= 0) return;

        try {
            await ApiService.post(ApiService.ROUTES.LABS.CREATE, {
                name: name,
                labType: type,
                capacity: cap
            });

            ToastService.success("Laboratory created successfully.");
            closeLabModal();
            await loadLabs();
        } catch (err) {
            ToastService.error(err.message || "Failed to create lab.");
        }
    }

    return {
        init,
        inspectLab,
        addSeatToSelectedLab,
        deleteSeat,
        openCreateLabModal,
        closeLabModal,
        submitCreateLab
    };
})();

document.addEventListener('DOMContentLoaded', AdminLabModule.init);
