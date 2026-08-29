const StudentEventsModule = (function () {
    let currentStudentId = 0;

    async function init() {
        const profile = AuthService.getUserProfile();
        if (!profile) return;
        currentStudentId = profile.id;

        await loadEvents();
    }

    async function loadEvents() {
        try {
            const data = await ApiService.get(ApiService.ROUTES.EVENTS.LIST);
            const events = data.data || data || [];
            const gridEl = document.getElementById('events-grid');

            if (events.length === 0) {
                gridEl.innerHTML = `<p class="text-secondary">No upcoming university events currently scheduled.</p>`;
                return;
            }

            gridEl.innerHTML = events.map(e => `
                <div class="card" style="margin-bottom: 0; display: flex; flex-direction: column; justify-content: space-between;">
                    <div>
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                            <span class="badge badge-approved">${e.venue?.name || e.Venue?.Name || 'Venue'}</span>
                            <span class="text-secondary" style="font-size: 12px;">Cap: ${e.capacity}</span>
                        </div>
                        <h3 style="font-size: 16px; font-weight: 700; color: var(--primary-navy); margin-bottom: 8px;">${e.title}</h3>
                        <p class="text-secondary" style="font-size: 13px; margin-bottom: 12px;">${e.description || 'No description provided.'}</p>
                        <div style="font-size: 12px; color: var(--text-primary); margin-bottom: 4px;">
                            🗓️ <strong>Start:</strong> ${new Date(e.startDateTime).toLocaleString()}
                        </div>
                        <div style="font-size: 12px; color: var(--text-primary); margin-bottom: 16px;">
                            🏁 <strong>End:</strong> ${new Date(e.endDateTime).toLocaleString()}
                        </div>
                    </div>
                    <div>
                        <button class="btn btn-primary" style="width: 100%;" onclick="StudentEventsModule.registerEvent(${e.id})">Register for Event</button>
                    </div>
                </div>
            `).join('');
        } catch (err) {
            console.error("Failed to load events:", err);
        }
    }

    async function registerEvent(eventId) {
        try {
            await ApiService.post(ApiService.ROUTES.EVENTS.REGISTER, {
                eventId: eventId,
                studentId: currentStudentId
            });
            ToastService.success("Successfully registered for event!");
            await loadEvents();
        } catch (err) {
            ToastService.error(err.message || "Failed to register for event.");
        }
    }

    return {
        init,
        registerEvent
    };
})();

document.addEventListener('DOMContentLoaded', StudentEventsModule.init);
