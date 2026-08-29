const AdminHostelModule = (function () {
    let currentAppIdToAssign = 0;
    let hostelsList = [];

    async function init() {
        await loadPendingApplications();
        await loadHostelsDirectory();
    }

    async function loadPendingApplications() {
        try {
            const data = await ApiService.get(ApiService.ROUTES.HOSTEL.PENDING_APPS);
            const apps = Array.isArray(data) ? data : (data && Array.isArray(data.data) ? data.data : []);
            const tbody = document.getElementById('pending-apps-tbody');

            if (apps.length === 0) {
                tbody.innerHTML = `<tr><td colspan="7" class="text-secondary" style="text-align: center;">No pending housing applications.</td></tr>`;
                return;
            }

            tbody.innerHTML = apps.map(a => `
                <tr>
                    <td><strong>${a.student?.indexNumber || a.Student?.IndexNumber || 'N/A'}</strong></td>
                    <td>${a.student?.fullName || a.Student?.FullName || 'Student'}</td>
                    <td>${a.preferredHostel?.name || a.PreferredHostel?.Name || 'Hostel'}</td>
                    <td>${a.termSemester || ''}</td>
                    <td>${a.specialRequirements || 'None'}</td>
                    <td>
                        <span class="badge badge-${(a.status || 'Pending').toLowerCase()}">
                            ${a.status === 'Approved' && (a.room?.roomNumber || a.Room?.RoomNumber) ? `Approved (Room #${a.room?.roomNumber || a.Room?.RoomNumber})` : a.status}
                        </span>
                    </td>
                    <td>
                        ${a.status === 'Pending' ? `
                            <button class="btn btn-sm btn-primary" onclick="AdminHostelModule.openAssignModal(${a.id}, '${(a.student?.fullName || a.Student?.FullName || 'Student').replace(/'/g, "\\'")}', ${a.preferredHostelId || (a.preferredHostel ? a.preferredHostel.id : 0)})">Approve & Assign Room →</button>
                            <button class="btn btn-sm btn-danger" onclick="AdminHostelModule.rejectApp(${a.id})">Reject</button>
                        ` : ''}
                        ${a.status === 'Approved' ? `
                            <button class="btn btn-sm btn-outline" onclick="AdminHostelModule.openAssignModal(${a.id}, '${(a.student?.fullName || a.Student?.FullName || 'Student').replace(/'/g, "\\'")}', ${a.preferredHostelId || (a.preferredHostel ? a.preferredHostel.id : 0)})">Reassign Room →</button>
                        ` : ''}
                    </td>
                </tr>
            `).join('');
        } catch (err) {
            console.error("Failed to load pending applications:", err);
        }
    }

    async function approveApp(id) {
        try {
            await ApiService.put(ApiService.ROUTES.HOSTEL.UPDATE_STATUS(id), { status: "Approved" });
            ToastService.success("Application approved! Automated notification sent to student.");
            await loadPendingApplications();
        } catch (err) {
            ToastService.error(err.message || "Failed to approve application.");
        }
    }

    async function rejectApp(id) {
        try {
            await ApiService.put(ApiService.ROUTES.HOSTEL.UPDATE_STATUS(id), { status: "Rejected" });
            ToastService.info("Application rejected.");
            await loadPendingApplications();
        } catch (err) {
            ToastService.error(err.message || "Failed to reject application.");
        }
    }

    async function loadHostelsDirectory() {
        try {
            const data = await ApiService.get(ApiService.ROUTES.HOSTEL.SELECT_HOSTELS);
            hostelsList = Array.isArray(data) ? data : (data && Array.isArray(data.data) ? data.data : []);
            const container = document.getElementById('hostels-directory-container');

            if (hostelsList.length === 0) {
                container.innerHTML = `<p class="text-secondary">No hostels configured yet.</p>`;
                return;
            }

            container.innerHTML = hostelsList.map(h => `
                <div class="card" style="margin-bottom: 16px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                        <h4 style="font-size: 16px; font-weight: 700; color: var(--primary-navy);">${h.name}</h4>
                        <div>
                            <button class="btn btn-sm btn-danger" onclick="AdminHostelModule.deleteHostel(${h.id})">Deactivate Hostel</button>
                        </div>
                    </div>
                    <div class="table-responsive">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Room Number</th>
                                    <th>Max Capacity</th>
                                    <th>Occupancy Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${(h.rooms || []).map(r => `
                                    <tr>
                                        <td><strong>Room ${r.roomNumber}</strong></td>
                                        <td>${r.maxCapacity} Students</td>
                                        <td><span class="badge badge-approved">Capacity Checked</span></td>
                                        <td>
                                            <button class="btn btn-sm btn-danger" onclick="AdminHostelModule.deleteRoom(${r.id})">Deactivate</button>
                                        </td>
                                    </tr>
                                `).join('') || '<tr><td colspan="4" class="text-secondary">No rooms added to this hostel yet.</td></tr>'}
                            </tbody>
                        </table>
                    </div>
                </div>
            `).join('');
        } catch (err) {
            console.error("Failed to load hostels directory:", err);
        }
    }

    async function openAssignModal(appId, studentName, hostelId) {
        currentAppIdToAssign = appId;
        document.getElementById('assign-student-name').textContent = `Assigning room for ${studentName}`;
        
        const selectEl = document.getElementById('select-assign-room');
        selectEl.innerHTML = `<option value="">-- Loading Vacant Rooms... --</option>`;
        document.getElementById('modal-assign-room').classList.add('active');

        try {
            if (hostelsList.length === 0) {
                const data = await ApiService.get(ApiService.ROUTES.HOSTEL.SELECT_HOSTELS);
                hostelsList = Array.isArray(data) ? data : (data && Array.isArray(data.data) ? data.data : []);
            }

            let allRooms = [];
            hostelsList.forEach(h => {
                if (h.rooms && h.rooms.length > 0) {
                    h.rooms.forEach(r => {
                        allRooms.push({
                            id: r.id,
                            roomNumber: r.roomNumber,
                            hostelName: h.name,
                            maxCapacity: r.maxCapacity,
                            isPreferred: h.id === hostelId
                        });
                    });
                }
            });

            if (allRooms.length > 0) {
                // Sort so rooms from preferred hostel appear at top
                allRooms.sort((a, b) => (b.isPreferred ? 1 : 0) - (a.isPreferred ? 1 : 0));

                selectEl.innerHTML = `<option value="">-- Select Vacant Room --</option>` +
                    allRooms.map(r => `<option value="${r.id}">${r.isPreferred ? '⭐ Preferred: ' : ''}Room #${r.roomNumber} (${r.hostelName} - Max Cap: ${r.maxCapacity})</option>`).join('');
            } else {
                selectEl.innerHTML = `<option value="">-- No Rooms Available (Click "+ Add Room" at top right to add rooms) --</option>`;
            }
        } catch (err) {
            ToastService.error("Failed to load rooms for allocation.");
        }
    }

    function closeAssignModal() {
        document.getElementById('modal-assign-room').classList.remove('active');
    }

    async function confirmRoomAssignment() {
        const roomId = parseInt(document.getElementById('select-assign-room').value);
        if (!roomId || !currentAppIdToAssign) {
            ToastService.error("Please select a room to assign.");
            return;
        }

        try {
            // Unified 1-Step Execution: Approve status + Link room
            await ApiService.put(ApiService.ROUTES.HOSTEL.UPDATE_STATUS(currentAppIdToAssign), { status: "Approved" });
            await ApiService.put(ApiService.ROUTES.HOSTEL.ASSIGN_ROOM(currentAppIdToAssign), { roomId: roomId });

            ToastService.success("Application approved & Room assigned successfully! Automated notification sent to student.");
            closeAssignModal();
            await loadPendingApplications();
            await loadHostelsDirectory();
        } catch (err) {
            ToastService.error(err.message || "Failed to assign room.");
        }
    }

    function openCreateHostelModal() { document.getElementById('modal-create-hostel').classList.add('active'); }
    function closeHostelModal() { document.getElementById('modal-create-hostel').classList.remove('active'); }

    async function submitCreateHostel() {
        const name = document.getElementById('input-hostel-name').value.trim();
        if (!name) return;

        try {
            await ApiService.post(ApiService.ROUTES.HOSTEL.HOSTELS, { name: name });
            ToastService.success("Hostel created successfully.");
            closeHostelModal();
            await loadHostelsDirectory();
        } catch (err) {
            ToastService.error(err.message || "Failed to create hostel.");
        }
    }

    function openCreateRoomModal() {
        const selectEl = document.getElementById('select-room-hostel');
        selectEl.innerHTML = hostelsList.map(h => `<option value="${h.id}">${h.name}</option>`).join('');
        document.getElementById('modal-create-room').classList.add('active');
    }

    function closeRoomModal() { document.getElementById('modal-create-room').classList.remove('active'); }

    async function submitCreateRoom() {
        const hostelId = parseInt(document.getElementById('select-room-hostel').value);
        const roomNum = document.getElementById('input-room-number').value.trim();
        const cap = parseInt(document.getElementById('input-room-capacity').value);

        if (!hostelId || !roomNum || cap <= 0) return;

        try {
            await ApiService.post(ApiService.ROUTES.HOSTEL.ROOMS(hostelId), {
                roomNumber: roomNum,
                maxCapacity: cap
            });

            ToastService.success("Room created successfully.");
            closeRoomModal();
            await loadHostelsDirectory();
        } catch (err) {
            ToastService.error(err.message || "Failed to create room.");
        }
    }

    async function deleteHostel(id) {
        if (!confirm("Are you sure you want to deactivate this hostel building?")) return;
        try {
            await ApiService.delete(ApiService.ROUTES.HOSTEL.DELETE_HOSTEL(id));
            ToastService.success("Hostel deactivated.");
            await loadHostelsDirectory();
        } catch (err) {
            ToastService.error(err.message || "Failed to deactivate hostel.");
        }
    }

    async function deleteRoom(id) {
        if (!confirm("Are you sure you want to deactivate this room?")) return;
        try {
            await ApiService.delete(ApiService.ROUTES.HOSTEL.DELETE_ROOM(id));
            ToastService.success("Room deactivated.");
            await loadHostelsDirectory();
        } catch (err) {
            ToastService.error(err.message || "Failed to deactivate room.");
        }
    }

    return {
        init,
        approveApp,
        rejectApp,
        openAssignModal,
        closeAssignModal,
        confirmRoomAssignment,
        openCreateHostelModal,
        closeHostelModal,
        submitCreateHostel,
        openCreateRoomModal,
        closeRoomModal,
        submitCreateRoom,
        deleteHostel,
        deleteRoom
    };
})();

document.addEventListener('DOMContentLoaded', AdminHostelModule.init);
