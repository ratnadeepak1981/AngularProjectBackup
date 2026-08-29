const AdminEventsModule = (function () {
    let venuesList = [];

    async function init() {
        await loadEvents();
        await loadVenues();
    }

    async function loadEvents() {
        try {
            const data = await ApiService.get(ApiService.ROUTES.EVENTS.LIST);
            //const eventsvenuesList = Array.isArray(data) ? data : (data && Array.isArray(data.data) ? data.data : []);

            const events = Array.isArray(data) ? data : (data && Array.isArray(data.data) ? data.data : []);
            const tbody = document.getElementById('events-admin-tbody');

            if (events.length === 0) {
                tbody.innerHTML = `<tr><td colspan="5" class="text-secondary" style="text-align: center;">No events currently scheduled.</td></tr>`;
                return;
            }

            tbody.innerHTML = events.map(e => `
                <tr>
                    <td><strong>${e.title}</strong></td>
                    <td><span class="badge badge-approved">${e.venue?.name || e.Venue?.Name || 'Venue'}</span></td>
                    <td>${new Date(e.startDateTime).toLocaleString()} - ${new Date(e.endDateTime).toLocaleString()}</td>
                    <td>${e.capacity} Students</td>
                    <td>
                        <button class="btn btn-sm btn-outline" onclick="AdminEventsModule.openAttendeesModal(${e.id}, '${e.title}')">Monitor Attendees →</button>
                    </td>
                </tr>
            `).join('');
        } catch (err) {
            console.error("Failed to load events:", err);
        }
    }

    async function loadVenues() {
        try {
            const data = await ApiService.get(ApiService.ROUTES.EVENTS.VENUES);
            venuesList = Array.isArray(data) ? data : (data && Array.isArray(data.data) ? data.data : []);
            const tbody = document.getElementById('venues-admin-tbody');

            if (venuesList.length === 0) {
                tbody.innerHTML = `<tr><td colspan="5" class="text-secondary" style="text-align: center;">No venues configured yet.</td></tr>`;
                return;
            }

            tbody.innerHTML = venuesList.map(v => `
                <tr>
                    <td><strong>${v.name}</strong></td>
                    <td><span class="badge badge-pending">${v.type || v.VenueType || 'Event Hall'}</span></td>
                    <td>${v.capacity} People</td>
                    <td><span class="badge badge-${v.isActive ? 'approved' : 'rejected'}">${v.isActive ? 'Active' : 'Deactivated'}</span></td>
                    <td>
                        <button class="btn btn-sm btn-danger" onclick="AdminEventsModule.deleteVenue(${v.id})">Deactivate</button>
                    </td>
                </tr>
            `).join('');
        } catch (err) {
            console.error("Failed to load venues:", err);
        }
    }

    async function openAttendeesModal(eventId, eventTitle) {
        document.getElementById('attendees-event-title').textContent = `Attendance Monitor: ${eventTitle}`;
        const tbody = document.getElementById('attendees-tbody');
        tbody.innerHTML = `<tr><td colspan="3" class="text-secondary">Loading registered attendees...</td></tr>`;
        document.getElementById('modal-attendees').classList.add('active');

        try {
            const data = await ApiService.get(ApiService.ROUTES.EVENTS.REGISTRATIONS(eventId));
            const regs = Array.isArray(data) ? data : (data && Array.isArray(data.data) ? data.data : []);

            if (regs.length === 0) {
                tbody.innerHTML = `<tr><td colspan="3" class="text-secondary" style="text-align: center;">No students registered for this event yet.</td></tr>`;
                return;
            }

            tbody.innerHTML = regs.map(r => `
                <tr>
                    <td><strong>${r.student?.indexNumber || r.Student?.IndexNumber || 'N/A'}</strong></td>
                    <td>${r.student?.fullName || r.Student?.FullName || 'Student'}</td>
                    <td><span class="badge badge-${(r.status || 'Confirmed').toLowerCase()}">${r.status}</span></td>
                </tr>
            `).join('');
        } catch (err) {
            tbody.innerHTML = `<tr><td colspan="3" class="text-danger" style="text-align: center;">Failed to fetch attendee records.</td></tr>`;
        }
    }

    function closeAttendeesModal() { document.getElementById('modal-attendees').classList.remove('active'); }

    function openCreateEventModal() {
        const selectEl = document.getElementById('select-event-venue');
        selectEl.innerHTML = `<option value="">-- Select Venue --</option>` +
            venuesList.map(v => `<option value="${v.id}">${v.name} (${v.type || 'Venue'} - Cap: ${v.capacity})</option>`).join('');
        document.getElementById('modal-create-event').classList.add('active');
    }

    function closeEventModal() { document.getElementById('modal-create-event').classList.remove('active'); }

    async function submitCreateEvent() {
        const title = document.getElementById('input-event-title').value.trim();
        const venueId = parseInt(document.getElementById('select-event-venue').value);
        const start = document.getElementById('input-event-start').value;
        const end = document.getElementById('input-event-end').value;
        const cap = parseInt(document.getElementById('input-event-capacity').value);
        const desc = document.getElementById('input-event-desc').value.trim();

        if (!title || !venueId || !start || !end || cap <= 0) return;

        try {
            await ApiService.post(ApiService.ROUTES.EVENTS.CREATE, {
                title: title,
                venueId: venueId,
                startDateTime: new Date(start).toISOString(),
                endDateTime: new Date(end).toISOString(),
                capacity: cap,
                description: desc
            });

            ToastService.success("Event scheduled successfully!");
            closeEventModal();
            await loadEvents();
        } catch (err) {
            ToastService.error(err.message || "Failed to schedule event. (Check for schedule overlap conflicts)");
        }
    }

    function openCreateVenueModal() { document.getElementById('modal-create-venue').classList.add('active'); }
    function closeVenueModal() { document.getElementById('modal-create-venue').classList.remove('active'); }

    async function submitCreateVenue() {
        const name = document.getElementById('input-venue-name').value.trim();
        const type = document.getElementById('select-venue-type').value;
        const cap = parseInt(document.getElementById('input-venue-capacity').value);

        if (!name || cap <= 0) return;

        try {
            await ApiService.post(ApiService.ROUTES.EVENTS.CREATE_VENUE, {
                name: name,
                venueType: type,
                capacity: cap
            });

            ToastService.success("Venue created successfully.");
            closeVenueModal();
            await loadVenues();
        } catch (err) {
            ToastService.error(err.message || "Failed to create venue.");
        }
    }

    async function deleteVenue(id) {
        if (!confirm("Are you sure you want to deactivate this venue?")) return;
        try {
            await ApiService.delete(ApiService.ROUTES.EVENTS.DELETE_VENUE(id));
            ToastService.success("Venue deactivated.");
            await loadVenues();
        } catch (err) {
            ToastService.error(err.message || "Failed to deactivate venue.");
        }
    }

    return {
        init,
        openAttendeesModal,
        closeAttendeesModal,
        openCreateEventModal,
        closeEventModal,
        submitCreateEvent,
        openCreateVenueModal,
        closeVenueModal,
        submitCreateVenue,
        deleteVenue
    };
})();

document.addEventListener('DOMContentLoaded', AdminEventsModule.init);
