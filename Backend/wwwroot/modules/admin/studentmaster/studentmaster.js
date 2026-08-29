

// 🟢 NEW ADDITION: Dictionary cache storage
const AdminStudentMasterModule = (function () {
    // 🗺️ Storage dictionary mapping IDs to Names (e.g., { 1: "Faculty of Computing" })
    let facultyMap = {}; 

    async function init() {
        await loadFacultiesCache(); // 1. Map university data names first
        await loadMasterList();     // 2. Render student layout grids cleanly
    }

    // 🔗 Fetch faculty names from Swagger API configuration endpoint
    async function loadFacultiesCache() {
        try {
            const url = ApiService.ROUTES.FACULTIES?.LIST || '/api/faculties';
            const response = await ApiService.get(url);
            
            // This targets the exact ".data" array seen in your Swagger screenshot
            let faculties = response?.data || response?.Data || (Array.isArray(response) ? response : []);
            
            // Populate our dictionary lookups 
            faculties.forEach(f => {
                const id = f.id || f.Id;
                const name = f.name || f.Name || `Faculty #${id}`;
                facultyMap[id] = name;
            });
        } catch (err) {
            console.error("Failed to build faculty name lookup mapping cache from backend endpoints:", err);
        }
    }

    async function loadMasterList() {
        try {
            const data = await ApiService.get(ApiService.ROUTES.STUDENTS.MASTER_LIST);
            const master = Array.isArray(data) ? data : (data && Array.isArray(data.data) ? data.data : []);
            const tbody = document.getElementById('master-tbody');

            if (!tbody) return;

            if (master.length === 0) {
                tbody.innerHTML = `<tr><td colspan="4" class="text-secondary" style="text-align: center;">No master intake records present.</td></tr>`;
                return;
            }

            tbody.innerHTML = master.map(m => {
                const facId = m.facultyId || m.FacultyId;
                // Cross-reference the dictionary, fallback gracefully if not found
                const facultyName = facultyMap[facId] || `Faculty #${facId}`; 

                return `
                    <tr>
                        <td><strong>${m.indexNumber || m.IndexNumber}</strong></td>
                        <td>${m.fullName || m.FullName}</td>
                        <!-- Displaying the clean text name here -->
                        <td><span style="font-weight: 500; color: var(--text-dark);">${facultyName}</span></td>
                        <td><span class="badge badge-${m.isUsed || m.IsUsed ? 'approved' : 'held'}">${m.isUsed || m.IsUsed ? 'Account Registered' : 'Pending Registration'}</span></td>
                    </tr>
                `;
            }).join('');
        } catch (err) {
            console.error("Failed to load master intake list:", err);
        }
    }

    function openImportModal() { 
        const modal = document.getElementById('modal-import-csv');
        if (modal) modal.classList.add('active'); 
    }
    
    function closeImportModal() { 
        const modal = document.getElementById('modal-import-csv');
        if (modal) modal.classList.remove('active'); 
    }

    async function submitImportCSV() {
        const fileInput = document.getElementById('input-csv-file');
        if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
            ToastService.error("Please select a CSV file to upload.");
            return;
        }

        const formData = new FormData();
        formData.append('file', fileInput.files[0]);

        try {
            await ApiService.upload(ApiService.ROUTES.STUDENTS.MASTER_IMPORT, formData);
            ToastService.success("Master CSV intake list imported successfully!");
            
            fileInput.value = ''; // Clean file input field template
            closeImportModal();
            await loadMasterList();
        } catch (err) {
            ToastService.error(err.message || "Failed to import CSV file.");
        }
    }

    // 🛡️ THE FIX: This object wrapper must sit inside the IIFE scope block
    return {
        init,
        openImportModal,
        closeImportModal,
        submitImportCSV
    };
})(); // <-- This closing parenthesis marks the true boundary of your IIFE structure!

// Initialize your component modules once the DOM settles
document.addEventListener('DOMContentLoaded', AdminStudentMasterModule.init);
