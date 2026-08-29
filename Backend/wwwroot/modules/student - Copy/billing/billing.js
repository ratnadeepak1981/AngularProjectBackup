const StudentBillingModule = (function () {
    let currentStudentId = 0;
    let paymentIdToCheckout = 0;
    let currentStudentProfile = null;
    let loadedLedgerItems = [];

    async function init() {
        const profile = AuthService.getUserProfile();
        if (profile) {
            currentStudentProfile = profile;
            currentStudentId = profile.id;
        }

        const urlParams = new URLSearchParams(window.location.search);
        paymentIdToCheckout = parseInt(urlParams.get('payId')) || 0;

        if (window.location.pathname.includes('checkout.html')) {
            await loadCheckoutDetails();
        } else {
            await loadLedger();
        }
    }

    async function loadLedger() {
        try {
            const data = await ApiService.get(ApiService.ROUTES.BILLING.LEDGER);
            loadedLedgerItems = data.data || data || [];
            const tbody = document.getElementById('student-billing-tbody');

            let unpaidTotal = 0;
            let paidTotal = 0;

            if (loadedLedgerItems.length === 0) {
                tbody.innerHTML = `<tr><td colspan="6" class="text-secondary" style="text-align: center;">No fee or fine items present on your ledger statement.</td></tr>`;
                if (document.getElementById('unpaid-balance-text')) document.getElementById('unpaid-balance-text').textContent = "$0.00";
                if (document.getElementById('paid-balance-text')) document.getElementById('paid-balance-text').textContent = "$0.00";
                return;
            }

            tbody.innerHTML = loadedLedgerItems.map(item => {
                const amt = item.amount || 0;
                if (item.status === 'Paid') paidTotal += amt;
                else unpaidTotal += amt;

                return `
                    <tr>
                        <td><strong>${item.feeType?.name || item.FeeType?.Name || item.description || 'University Fee'}</strong></td>
                        <td style="font-weight: 700; color: var(--primary-navy);">$${amt.toFixed(2)}</td>
                        <td>${item.dueDate ? new Date(item.dueDate).toLocaleDateString() : 'N/A'}</td>
                        <td><span class="badge badge-${item.status === 'Paid' ? 'approved' : 'held'}">${item.status}</span></td>
                        <td>${item.status === 'Paid' ? `Receipt #${item.receiptNumber || 'REC-101'}<br><small>${new Date(item.paidAt).toLocaleDateString()}</small>` : '-'}</td>
                        <td>
                            ${item.status === 'Unpaid' 
                                ? `<a href="checkout.html?payId=${item.id}" class="btn btn-sm btn-primary">Pay Fee Online →</a>` 
                                : `<button class="btn btn-sm btn-outline" onclick="StudentBillingModule.openReceiptModal(${item.id})">📄 View Receipt</button>`}
                        </td>
                    </tr>
                `;
            }).join('');

            if (document.getElementById('unpaid-balance-text')) document.getElementById('unpaid-balance-text').textContent = `$${unpaidTotal.toFixed(2)}`;
            if (document.getElementById('paid-balance-text')) document.getElementById('paid-balance-text').textContent = `$${paidTotal.toFixed(2)}`;

        } catch (err) {
            console.error("Failed to load student fee ledger:", err);
        }
    }

    async function loadCheckoutDetails() {
        if (!paymentIdToCheckout) return;

        try {
            const data = await ApiService.get(ApiService.ROUTES.BILLING.LEDGER);
            loadedLedgerItems = data.data || data || [];
            const item = loadedLedgerItems.find(i => i.id === paymentIdToCheckout);

            if (!item) {
                ToastService.error("Target payment line item not found.");
                return;
            }

            const studentName = currentStudentProfile?.fullName || item.student?.fullName || item.Student?.FullName || 'Student Account';
            const studentIndex = currentStudentProfile?.indexNumber || item.student?.indexNumber || item.Student?.IndexNumber || 'S1002';
            const feeName = item.feeType?.name || item.FeeType?.Name || item.description || 'University Fee';
            const amt = item.amount || 0;

            if (document.getElementById('checkout-student-name')) document.getElementById('checkout-student-name').textContent = studentName;
            if (document.getElementById('checkout-student-index')) document.getElementById('checkout-student-index').textContent = studentIndex;
            if (document.getElementById('checkout-desc')) document.getElementById('checkout-desc').textContent = feeName;
            if (document.getElementById('checkout-due-date')) document.getElementById('checkout-due-date').textContent = item.dueDate ? new Date(item.dueDate).toLocaleDateString() : 'Immediate';
            if (document.getElementById('checkout-subtotal')) document.getElementById('checkout-subtotal').textContent = `$${amt.toFixed(2)}`;
            if (document.getElementById('checkout-amount')) document.getElementById('checkout-amount').textContent = `$${amt.toFixed(2)}`;
            if (document.getElementById('btn-process-payment')) document.getElementById('btn-process-payment').textContent = `🔒 Complete Payment & Submit ($${amt.toFixed(2)}) →`;
            
            if (document.getElementById('checkout-cardholder')) document.getElementById('checkout-cardholder').value = studentName;

        } catch (err) {
            ToastService.error("Failed to fetch payment details.");
        }
    }

    function togglePaymentFields() {
        const method = document.getElementById('checkout-method').value;
        const cardFields = document.getElementById('card-payment-fields');
        const bankFields = document.getElementById('bank-payment-fields');

        if (method.includes('Bank')) {
            if (cardFields) cardFields.style.display = 'none';
            if (bankFields) bankFields.style.display = 'block';
        } else {
            if (cardFields) cardFields.style.display = 'block';
            if (bankFields) bankFields.style.display = 'none';
        }
    }

    async function processPayment() {
        if (!paymentIdToCheckout) return;

        try {
            const method = document.getElementById('checkout-method').value;
            const res = await ApiService.post(ApiService.ROUTES.BILLING.PAY(paymentIdToCheckout), {
                paymentMethod: method
            });

            const paymentData = res.data || res;
            ToastService.success("Payment cleared successfully! Generating official bursar receipt...");
            
            // Pop up official receipt modal directly
            openReceiptModalWithData({
                receiptNumber: paymentData.receiptNumber || 'REC-2026-889104',
                studentName: currentStudentProfile?.fullName || 'Student Account',
                studentIndex: currentStudentProfile?.indexNumber || 'S1002',
                feeName: document.getElementById('checkout-desc')?.textContent || 'Tuition Fee',
                amount: document.getElementById('checkout-amount')?.textContent || '$0.00',
                method: method,
                paidAt: new Date().toLocaleDateString()
            });

        } catch (err) {
            ToastService.error(err.message || "Payment processing failed.");
        }
    }

    async function openReceiptModal(itemId) {
        let item = loadedLedgerItems.find(i => i.id === itemId);
        if (!item) {
            try {
                const data = await ApiService.get(ApiService.ROUTES.BILLING.LEDGER);
                loadedLedgerItems = data.data || data || [];
                item = loadedLedgerItems.find(i => i.id === itemId);
            } catch (err) {}
        }

        if (!item) return;

        openReceiptModalWithData({
            receiptNumber: item.receiptNumber || 'REC-2026-889104',
            studentName: currentStudentProfile?.fullName || item.student?.fullName || item.Student?.FullName || 'Student Account',
            studentIndex: currentStudentProfile?.indexNumber || item.student?.indexNumber || item.Student?.IndexNumber || 'S1002',
            feeName: item.feeType?.name || item.FeeType?.Name || item.description || 'University Fee',
            amount: `$${(item.amount || 0).toFixed(2)}`,
            method: item.paymentMethod || 'Visa / Mastercard',
            paidAt: item.paidAt ? new Date(item.paidAt).toLocaleDateString() : new Date().toLocaleDateString()
        });
    }

    function openReceiptModalWithData(data) {
        if (document.getElementById('receipt-no')) document.getElementById('receipt-no').textContent = `Receipt #: ${data.receiptNumber}`;
        if (document.getElementById('receipt-student-name')) document.getElementById('receipt-student-name').textContent = data.studentName;
        if (document.getElementById('receipt-student-index')) document.getElementById('receipt-student-index').textContent = data.studentIndex;
        if (document.getElementById('receipt-fee-name')) document.getElementById('receipt-fee-name').textContent = data.feeName;
        if (document.getElementById('receipt-amount')) document.getElementById('receipt-amount').textContent = data.amount;
        if (document.getElementById('receipt-method')) document.getElementById('receipt-method').textContent = data.method;
        if (document.getElementById('receipt-date')) document.getElementById('receipt-date').textContent = data.paidAt;

        const modal = document.getElementById('modal-official-receipt');
        if (modal) modal.classList.add('active');
    }

    function closeReceiptModal() {
        const modal = document.getElementById('modal-official-receipt');
        if (modal) modal.classList.remove('active');
        if (window.location.pathname.includes('checkout.html')) {
            window.location.href = "index.html";
        }
    }

    function printCurrentReceipt() {
        window.print();
    }

    return {
        init,
        togglePaymentFields,
        processPayment,
        openReceiptModal,
        closeReceiptModal,
        printCurrentReceipt
    };
})();

document.addEventListener('DOMContentLoaded', StudentBillingModule.init);
