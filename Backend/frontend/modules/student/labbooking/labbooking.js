const StudentLabBookingModule = (function () {
    let currentStudentId = 0;
    let selectedLabId = 0;
    let selectedSeatId = 0;
    let activeHoldBookingId = 0;
    let holdTimerInterval = null;

    async function init() {
        const profile = AuthService.getUserProfile();
        if (!profile) return;
        currentStudentId = profile.id;

        // Set default date to today
        document.getElementById('booking-date').value = new Date().toISOString().split('T')[0];

        await loadLabs();
        await loadMyBookings();
    }

    async function loadLabs() {
        try {
            const data = await ApiService.get(ApiService.ROUTES.LABS.LIST);
            const labs = data.data || data || [];
            const selectEl = document.getElementById('select-lab');
            selectEl.innerHTML = `<option value="">-- Select Laboratory --</option>` +
                labs.map(l => `<option value="${l.id}" data-type="${l.labType}">${l.name} (${l.labType} Lab - Cap: ${l.capacity})</option>`).join('');
        } catch (err) {
            ToastService.error("Failed to fetch campus laboratories.");
        }
    }

    function onLabSelect() {
        const selectEl = document.getElementById('select-lab');
        selectedLabId = parseInt(selectEl.value) || 0;
        loadLayout();
    }

    async function loadLayout() {
        if (!selectedLabId) return;

        const wrapper = document.getElementById('seat-grid-wrapper');
        const selectEl = document.getElementById('select-lab');
        const selectedOption = selectEl.options[selectEl.selectedIndex];
        const labType = selectedOption ? selectedOption.getAttribute('data-type') : 'Computer';

        wrapper.innerHTML = `<p class="text-secondary" style="text-align: center; padding: 20px;">Loading workstation seat layout...</p>`;

        const dateVal = document.getElementById('booking-date').value || new Date().toISOString().split('T')[0];
        const slotVal = document.getElementById('select-timeslot').value || '09:00 - 11:00 AM';

        try {
            const layoutUrl = `${ApiService.ROUTES.LABS.LAYOUT(selectedLabId)}?date=${encodeURIComponent(dateVal)}&timeSlot=${encodeURIComponent(slotVal)}`;
            const resData = await ApiService.get(layoutUrl);
            const layout = resData.data || resData;
            const seats = layout.seats || layout.Seats || [];

            if (labType === 'Science') {
                const totalCap = layout.capacity || layout.Capacity || 30;
                const occupiedCount = layout.occupiedCount || layout.OccupiedCount || 0;
                const availableCount = Math.max(0, totalCap - occupiedCount);

                let slotItems = [];
                for (let i = 1; i <= totalCap; i++) {
                    const isAvailable = i <= availableCount;
                    slotItems.push(`
                        <div class="seat-node ${isAvailable ? 'available' : 'occupied'}"
                             style="${isAvailable ? 'cursor: pointer;' : 'opacity: 0.6; cursor: not-allowed;'}"
                             onclick="${isAvailable ? `StudentLabBookingModule.bookScienceLab(${i})` : ''}"
                             title="Science Bench Slot #${i} (${isAvailable ? 'Available' : 'Occupied'})">
                            <span class="seat-icon">🧪</span>
                            <span>Slot #${i}</span>
                            <small class="badge badge-${isAvailable ? 'approved' : 'rejected'}" style="margin-top: 4px; display: inline-block;">
                                ${isAvailable ? 'Available' : 'Occupied'}
                            </small>
                        </div>
                    `);
                }

                wrapper.innerHTML = `
                    <div style="margin-bottom: 16px;">
                        <h4 style="color: var(--primary-navy); font-weight: 700;">🧪 Science Laboratory Bench Slots Layout</h4>
                        <p class="text-secondary" style="font-size: 13px;">Select an available bench slot below to place a 15-minute reservation hold. (${availableCount} of ${totalCap} Slots Available)</p>
                    </div>
                    <div class="seat-grid">
                        ${slotItems.join('')}
                    </div>
                `;
                return;
            }

            if (seats.length === 0) {
                wrapper.innerHTML = `<p class="text-secondary" style="text-align: center; padding: 20px;">No workstation seats configured for this computer lab yet.</p>`;
                return;
            }

            wrapper.innerHTML = `
                <div style="margin-bottom: 16px;">
                    <h4 style="color: var(--primary-navy); font-weight: 700;">💻 Computer Lab Workstation Seats Grid Layout</h4>
                    <p class="text-secondary" style="font-size: 13px;">Click on any green 'Available' seat to reserve a 15-minute hold. Held or Occupied seats cannot be selected.</p>
                </div>
                <div class="seat-grid">
                    ${seats.map(s => {
                        const statusClass = (s.status || 'Available').toLowerCase();
                        const isSelectable = statusClass === 'available';
                        return `
                            <div class="seat-node ${statusClass}" 
                                 style="${isSelectable ? 'cursor: pointer;' : 'opacity: 0.55; cursor: not-allowed;'}"
                                 onclick="${isSelectable ? `StudentLabBookingModule.selectSeat(${s.id}, '${s.seatNumber}')` : ''}"
                                 title="Workstation ${s.seatNumber} (${s.status})">
                                <span class="seat-icon">💻</span>
                                <span>Seat ${s.seatNumber}</span>
                                <small class="badge badge-${statusClass === 'available' ? 'approved' : statusClass === 'held' ? 'held' : 'rejected'}" style="margin-top: 4px; display: inline-block;">
                                    ${s.status || 'Available'}
                                </small>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        } catch (err) {
            wrapper.innerHTML = `<p class="text-danger" style="text-align: center; padding: 20px;">Failed to render lab seat matrix.</p>`;
        }
    }

    async function selectSeat(seatId, seatNumber) {
        selectedSeatId = seatId;
        const date = document.getElementById('booking-date').value;
        const slot = document.getElementById('select-timeslot').value;

        if (!confirm(`Reserve workstation Seat ${seatNumber} for 15-minute hold?`)) return;

        try {
            const payload = {
                labId: selectedLabId,
                studentId: currentStudentId,
                seatId: seatId,
                bookingDate: date,
                timeSlot: slot
            };

            const res = await ApiService.post(ApiService.ROUTES.LABS.BOOK, payload);
            const booking = res.data || res;
            activeHoldBookingId = booking.id;

            ToastService.success(`Seat ${seatNumber} placed on 15-minute hold! Please confirm your booking.`);
            startHoldTimer(booking.expiresAt || new Date(Date.now() + 15 * 60000).toISOString());
            await loadLayout();
            await loadMyBookings();
        } catch (err) {
            ToastService.error(err.message || "Failed to place seat hold.");
        }
    }

    async function bookScienceLab() {
        const date = document.getElementById('booking-date').value;
        const slot = document.getElementById('select-timeslot').value;

        try {
            const payload = {
                labId: selectedLabId,
                studentId: currentStudentId,
                seatId: null,
                bookingDate: date,
                timeSlot: slot
            };

            const res = await ApiService.post(ApiService.ROUTES.LABS.BOOK, payload);
            const booking = res.data || res;
            activeHoldBookingId = booking.id;

            ToastService.success("Science Lab slot reserved on hold!");
            startHoldTimer(booking.expiresAt || new Date(Date.now() + 15 * 60000).toISOString());
            await loadMyBookings();
        } catch (err) {
            ToastService.error(err.message || "Failed to reserve Science Lab slot.");
        }
    }

    function startHoldTimer(expiresAtIso) {
        const banner = document.getElementById('hold-timer-banner');
        banner.style.display = 'flex';

        if (holdTimerInterval) clearInterval(holdTimerInterval);

        const targetTime = new Date(expiresAtIso).getTime();

        holdTimerInterval = setInterval(() => {
            const now = new Date().getTime();
            const diff = targetTime - now;

            if (diff <= 0) {
                clearInterval(holdTimerInterval);
                banner.style.display = 'none';
                ToastService.error("Your 15-minute seat hold has expired!");
                loadLayout();
                loadMyBookings();
                return;
            }

            const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const secs = Math.floor((diff % (1000 * 60)) / 1000);

            document.getElementById('timer-minutes').textContent = String(mins).padStart(2, '0');
            document.getElementById('timer-seconds').textContent = String(secs).padStart(2, '0');
        }, 1000);
    }

    async function confirmHold() {
        if (!activeHoldBookingId) return;

        try {
            await ApiService.put(ApiService.ROUTES.LABS.CONFIRM(activeHoldBookingId));
            ToastService.success("Lab seat booking confirmed successfully!");

            if (holdTimerInterval) clearInterval(holdTimerInterval);
            document.getElementById('hold-timer-banner').style.display = 'none';
            activeHoldBookingId = 0;

            await loadLayout();
            await loadMyBookings();
        } catch (err) {
            ToastService.error(err.message || "Failed to confirm booking.");
        }
    }

    async function cancelHold() {
        if (!activeHoldBookingId) return;

        try {
            await ApiService.delete(ApiService.ROUTES.LABS.CANCEL(activeHoldBookingId));
            ToastService.info("Seat hold released.");

            if (holdTimerInterval) clearInterval(holdTimerInterval);
            document.getElementById('hold-timer-banner').style.display = 'none';
            activeHoldBookingId = 0;

            await loadLayout();
            await loadMyBookings();
        } catch (err) {
            ToastService.error(err.message || "Failed to cancel hold.");
        }
    }

    async function cancelBooking(bookingId) {
        if (!confirm("Are you sure you want to cancel this lab booking?")) return;

        try {
            await ApiService.delete(ApiService.ROUTES.LABS.CANCEL(bookingId));
            ToastService.success("Lab booking cancelled.");
            await loadLayout();
            await loadMyBookings();
        } catch (err) {
            ToastService.error(err.message || "Failed to cancel booking.");
        }
    }

    async function loadMyBookings() {
        try {
            const data = await ApiService.get(ApiService.ROUTES.LABS.STUDENT_BOOKINGS(currentStudentId));
            const bookings = data.data || data || [];
            const tbody = document.getElementById('student-bookings-tbody');

            if (bookings.length === 0) {
                tbody.innerHTML = `<tr><td colspan="6" class="text-secondary" style="text-align: center;">No active or past lab bookings found.</td></tr>`;
                return;
            }

            tbody.innerHTML = bookings.map(b => `
                <tr>
                    <td><strong>${b.lab?.name || b.Lab?.Name || 'Lab'}</strong></td>
                    <td><span class="badge badge-pending">${b.lab?.labType || b.Lab?.LabType || 'Lab'}</span></td>
                    <td>${b.seat?.seatNumber ? `Seat #${b.seat.seatNumber}` : 'General Slot'}</td>
                    <td>${b.bookingDate ? new Date(b.bookingDate).toLocaleDateString() : ''} (${b.timeSlot})</td>
                    <td><span class="badge badge-${(b.status || 'Held').toLowerCase()}">${b.status}</span></td>
                    <td>
                        ${b.status === 'Held' ? `<button class="btn btn-sm btn-primary" onclick="StudentLabBookingModule.confirmHoldDirect(${b.id})">Confirm</button>` : ''}
                        <button class="btn btn-sm btn-danger" onclick="StudentLabBookingModule.cancelBooking(${b.id})">Cancel</button>
                    </td>
                </tr>
            `).join('');
        } catch (err) {
            console.error("Failed to load student bookings:", err);
        }
    }

    async function confirmHoldDirect(id) {
        activeHoldBookingId = id;
        await confirmHold();
    }

    return {
        init,
        onLabSelect,
        loadLayout,
        selectSeat,
        bookScienceLab,
        confirmHold,
        confirmHoldDirect,
        cancelHold,
        cancelBooking
    };
})();

document.addEventListener('DOMContentLoaded', StudentLabBookingModule.init);
