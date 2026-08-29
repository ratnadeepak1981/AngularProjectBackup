const AdminBillingModule = (function () {
    let feeTypesList = [];
    let studentsList = [];

    async function init() {
        // Set default due date to 30 days from now
        const d = new Date();
        d.setDate(d.getDate() + 30);
        document.getElementById('input-assign-duedate').value = d.toISOString().split('T')[0];

        await loadFeeLedger();
        await loadFeeTypes();
        await loadStudents();
    }

    async function loadFeeLedger() {
        try {
            const data = await ApiService.get(ApiService.ROUTES.BILLING.LEDGER);
            const ledger = Array.isArray(data) ? data : (data && Array.isArray(data.data) ? data.data : []);
            const tbody = document.getElementById('billing-admin-tbody');

            if (ledger.length === 0) {
                tbody.innerHTML = `<tr><td colspan="6" class="text-secondary" style="text-align: center;">No fee assignments present on ledger.</td></tr>`;
                return;
            }

            tbody.innerHTML = ledger.map(i => `
                <tr>
                    <td><strong>${i.student?.fullName || i.Student?.FullName || 'Student'}</strong> (${i.student?.indexNumber || i.Student?.IndexNumber || 'N/A'})</td>
                    <td>${i.feeType?.name || i.FeeType?.Name || i.description || 'Fee'}</td>
                    <td style="font-weight: 700; color: var(--primary-navy);">$${(i.amount || 0).toFixed(2)}</td>
                    <td><span class="badge badge-${i.status === 'Paid' ? 'approved' : 'held'}">${i.status}</span></td>
                    <td>${i.status === 'Paid' ? `Receipt #${i.receiptNumber || 'REC'}<br><small>${new Date(i.paidAt).toLocaleDateString()}</small>` : 'Unpaid'}</td>
                    <td>
                        ${i.status === 'Unpaid' 
                            ? `<button class="btn btn-sm btn-danger" onclick="AdminBillingModule.cancelUnpaidFee(${i.id})">Cancel Assignment</button>` 
                            : '<span class="text-secondary" style="font-size: 12px;">Paid (Immutable [BRD Rule 9])</span>'}
                    </td>
                </tr>
            `).join('');
        } catch (err) {
            console.error("Failed to load fee ledger:", err);
        }
    }

    async function loadFeeTypes() {
        try {
            const data = await ApiService.get(ApiService.ROUTES.BILLING.FEE_TYPES);
            feeTypesList = Array.isArray(data) ? data : (data && Array.isArray(data.data) ? data.data : []);
            const tbody = document.getElementById('fee-types-tbody');

            if (feeTypesList.length === 0) {
                tbody.innerHTML = `<tr><td colspan="3" class="text-secondary" style="text-align: center;">No fee types present.</td></tr>`;
                return;
            }

            tbody.innerHTML = feeTypesList.map(ft => `
                <tr>
                    <td><strong>${ft.name}</strong></td>
                    <td><span class="badge badge-${ft.isActive ? 'approved' : 'rejected'}">${ft.isActive ? 'Active' : 'Deactivated'}</span></td>
                    <td>
                        <button class="btn btn-sm btn-danger" onclick="AdminBillingModule.deleteFeeType(${ft.id})">Deactivate Fee Type</button>
                    </td>
                </tr>
            `).join('');
        } catch (err) {
            console.error("Failed to load fee types:", err);
        }
    }

    async function loadStudents() {
        try {
            const data = await ApiService.get(ApiService.ROUTES.STUDENTS.DIRECTORY);
            studentsList = Array.isArray(data) ? data : (data && Array.isArray(data.data) ? data.data : []);
        } catch (err) {
            console.error("Failed to load students directory:", err);
        }
    }

    function openAssignFeeModal() {
        const studentSelect = document.getElementById('select-assign-student');
        studentSelect.innerHTML = `<option value="">-- Select Student --</option>` +
          //  studentsList.map(s => `<option value="${s.id}">${s.fullName} (${s.indexNumber})</option>`).join('');

            studentsList.map(s => `<option value="${s.id || s.Id}">${s.fullName || s.FullName || 'Student'} (${s.indexNumber || s.IndexNumber || 'N/A'})</option>`)



        const feeTypeSelect = document.getElementById('select-assign-feetype');
        feeTypeSelect.innerHTML = `<option value="">-- Select Fee Type --</option>` +
           // feeTypesList.map(ft => `<option value="${ft.id}">${ft.name}</option>`).join('');
            feeTypesList.map(ft => `<option value="${ft.id || ft.Id}">${ft.name || ft.Name || 'Fee Type'}</option>`)
        document.getElementById('modal-assign-fee').classList.add('active');
    }

    function closeAssignFeeModal() { document.getElementById('modal-assign-fee').classList.remove('active'); }

    async function submitAssignFee() {
        // 1. Core numeric value extractions
        const studentId = parseInt(document.getElementById('select-assign-student').value);
        const feeTypeId = parseInt(document.getElementById('select-assign-feetype').value);
        const amt = parseFloat(document.getElementById('input-assign-amount').value);
        
        // 2. Extract the HTML date input string value present on your screen layout
        const dueDateValue = document.getElementById('input-assign-duedate').value; // e.g. "2026-09-09"
        
        // 🛑 FIX: Dynamically construct the missing 'billingPeriod' variable using your layout's chosen date value
        let billingPeriod = "2026/Semester 2"; // Safe fallback default configuration
        if (dueDateValue) {
            const dateParts = dueDateValue.split('-'); // ["2026", "09", "09"]
            billingPeriod = `${dateParts[0]}/${dateParts[1]}`; // Automatically maps to text: "2026/09"
        }

        // 🛑 FIX: Explicitly declare the missing description variable context string
        const description = "System Fee Assignment (Admin Tool Allocation Invoice)";

        // 3. Extract target student context metadata records map configuration properties
        const chosenStudent = studentsList.find(s => (s.id || s.Id) === studentId);
        const facultyId = parseInt(chosenStudent?.facultyId || chosenStudent?.FacultyId || 1);

        if (isNaN(studentId) || isNaN(feeTypeId) || isNaN(amt) || amt <= 0) {
            ToastService.error("Please verify that all fields have been selected with valid inputs.");
            return;
        }

        try {
            // 🚀 PERFECT EXECUTION MATCH: Satisfies your active C# integer & text validation payload properties cleanly
            await ApiService.post(ApiService.ROUTES.BILLING.ASSIGN_FEE, {
                feeTypeId: feeTypeId,
                amount: amt,
                billingPeriod: billingPeriod, // Now correctly defined and populated!
                description: description,     // Now correctly defined and populated!
                studentId: studentId,
                facultyId: facultyId
            });

            ToastService.success("Fee assigned successfully! Transaction committed to ledger database.");
            closeAssignFeeModal();
            
            // Clean interface metric controls
            document.getElementById('input-assign-amount').value = '';
            
            await loadFeeLedger();
        } catch (err) {
            ToastService.error(err.message || "Failed to finalize ledger assignment record parameters.");
        }
    }


    function openCreateFeeTypeModal() { document.getElementById('modal-create-feetype').classList.add('active'); }
    function closeFeeTypeModal() { document.getElementById('modal-create-feetype').classList.remove('active'); }

    async function submitCreateFeeType() {
        const name = document.getElementById('input-feetype-name').value.trim();
        if (!name) return;

        try {
            await ApiService.post(ApiService.ROUTES.BILLING.CREATE_FEE_TYPE, { Name: name });
            ToastService.success("Fee type created successfully.");
            closeFeeTypeModal();
            await loadFeeTypes();
        } catch (err) {
            ToastService.error(err.message || "Failed to create fee type.");
        }
    }

    async function deleteFeeType(id) {
        if (!confirm("Are you sure you want to soft-deactivate this fee type?")) return;

        try {
            await ApiService.delete(ApiService.ROUTES.BILLING.DELETE_FEE_TYPE(id));
            ToastService.success("Fee type deactivated.");
            await loadFeeTypes();
        } catch (err) {
            ToastService.error(err.message || "Failed to deactivate fee type.");
        }
    }

    async function cancelUnpaidFee(id) {
        if (!confirm("Are you sure you want to cancel this unpaid fee assignment?")) return;

        try {
            await ApiService.delete(ApiService.ROUTES.BILLING.CANCEL_UNPAID(id));
            ToastService.success("Unpaid fee assignment cancelled.");
            await loadFeeLedger();
        } catch (err) {
            ToastService.error(err.message || "Failed to cancel unpaid fee assignment.");
        }
    }

    return {
        init,
        openAssignFeeModal,
        closeAssignFeeModal,
        submitAssignFee,
        openCreateFeeTypeModal,
        closeFeeTypeModal,
        submitCreateFeeType,
        deleteFeeType,
        cancelUnpaidFee
    };
})();

document.addEventListener('DOMContentLoaded', AdminBillingModule.init);
