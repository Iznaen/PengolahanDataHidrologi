// Database Kualitas Air Module
// Fase 1: Skeleton Implementation
// Fase 3: Real data handling

const { invoke } = window.__TAURI__.core;

// ============================================
// UTILITY FUNCTIONS FOR DATA TRANSFORMATION
// Fase 3 Step 2: Handle Option<T> fields from Rust
// ============================================

/**
 * Safely get value from Option<T> field with fallback
 * @param {any} value - The Option<T> value from Rust (could be null, undefined, or actual value)
 * @param {any} fallback - Default value if null/undefined
 * @returns {any} Safe value for display
 */
function getSafeValue(value, fallback = '-') {
    if (value === null || value === undefined || value === '') {
        return fallback;
    }
    return value;
}

/**
 * Format number with optional decimal places
 * @param {number} num - Number to format
 * @param {number} decimals - Decimal places (default: 2)
 * @returns {string} Formatted number or fallback
 */
function formatNumber(num, decimals = 2) {
    if (num === null || num === undefined || isNaN(num)) {
        return '-';
    }
    return Number(num).toFixed(decimals);
}

/**
 * Validate and transform data from Rust backend
 * Ensures all Option<T> fields are properly handled
 * @param {Array} data - Raw data from get_all_kualitas_air
 * @returns {Array} Transformed data ready for display
 */
function transformData(data) {
    if (!Array.isArray(data)) {
        console.warn('transformData: Input is not an array', data);
        return [];
    }
    
    // Debug: log first record structure to see field names
    if (data.length > 0) {
        console.log('🔍 First raw record from Rust:', data[0]);
        console.log('🔍 Available fields:', Object.keys(data[0]));
    }
    
    return data.map(record => {
        // Create a shallow copy to avoid mutating original
        const transformed = { ...record };
        
        // Transform critical fields for card display
        // Note: Rust uses mixed naming (some snake_case, some camelCase due to serde rename)
        const statusIp = record.status_ip || record.statusIp;
        const nilaiIp = record.nilai_ip || record.nilaiIp;
        
        transformed.display_nama_pos = getSafeValue(record.nama_pos, 'Data Tanpa Nama');
        transformed.display_das = getSafeValue(record.das, getSafeValue(record.sungai, getSafeValue(record.provinsi, '-')));
        transformed.display_lokasi = getLokasiDisplay(record);
        transformed.display_pelaksana = getPelaksanaDisplay(record);
        transformed.display_tanggal = formatDate(getSafeValue(record.tanggal_sampling, ''));
        transformed.display_waktu = getSafeValue(record.waktu_sampling, '');
        transformed.display_nilai_ip = formatNumber(nilaiIp, 2);
        transformed.display_status_ip = getSafeValue(statusIp, 'Unknown');
        
        // Additional formatted fields for potential modal use
        transformed.formatted_temperatur = formatNumber(record.temperatur, 1);
        transformed.formatted_ph = formatNumber(record.ph, 1);
        transformed.formatted_oksigen = formatNumber(record.oksigen, 1);
        transformed.formatted_bod = formatNumber(record.bod, 2);
        transformed.formatted_cod = formatNumber(record.cod, 2);
        transformed.formatted_tss = formatNumber(record.tss, 0);
        
        return transformed;
    });
}

/**
 * Get location display string from record
 * Priority: DAS > Sungai > Provinsi > Kabupaten
 */
function getLokasiDisplay(record) {
    const locations = [
        record.das,
        record.sungai,
        record.provinsi,
        record.kabupaten,
        record.wilayah_sungai
    ];
    
    for (const loc of locations) {
        const safeLoc = getSafeValue(loc, '');
        if (safeLoc !== '' && safeLoc !== '-') {
            return safeLoc;
        }
    }
    return '-';
}

/**
 * Get pelaksana/lab display string
 * Priority: Pelaksana > Laboratorium
 */
function getPelaksanaDisplay(record) {
    const pelaksana = getSafeValue(record.pelaksana, '');
    const lab = getSafeValue(record.laboratorium, '');
    
    if (pelaksana && pelaksana !== '-') return pelaksana;
    if (lab && lab !== '-') return lab;
    return '-';
}

/**
 * Enhanced getStatusInfo that handles real data
 * Uses nilai_ip for color coding if status_ip is missing
 */
function getStatusInfo(statusIp, nilaiIp) {
    // First try to get status from status_ip
    if (statusIp) {
        const status = statusIp.toLowerCase();
        
        if (status.includes('memenuhi')) {
            return { text: 'Memenuhi', color: '#27ae60', colorClass: 'status-good' };
        } else if (status.includes('ringan')) {
            return { text: 'Cemar Ringan', color: '#f39c12', colorClass: 'status-light' };
        } else if (status.includes('sedang')) {
            return { text: 'Cemar Sedang', color: '#e67e22', colorClass: 'status-medium' };
        } else if (status.includes('berat')) {
            return { text: 'Cemar Berat', color: '#e74c3c', colorClass: 'status-heavy' };
        }
    }
    
    // Fallback: use nilai_ip to determine status
    if (nilaiIp !== null && nilaiIp !== undefined && !isNaN(nilaiIp)) {
        const ip = Number(nilaiIp);
        if (ip <= 1.0) {
            return { text: 'Memenuhi', color: '#27ae60', colorClass: 'status-good' };
        } else if (ip <= 5.0) {
            return { text: 'Cemar Ringan', color: '#f39c12', colorClass: 'status-light' };
        } else if (ip <= 10.0) {
            return { text: 'Cemar Sedang', color: '#e67e22', colorClass: 'status-medium' };
        } else {
            return { text: 'Cemar Berat', color: '#e74c3c', colorClass: 'status-heavy' };
        }
    }
    
    // Default unknown
    return { text: 'Unknown', color: '#95a5a6', colorClass: 'status-unknown' };
}

/**
 * Format date from various formats to readable "dd Mmm yyyy" format
 * Handles: dd-mm-yyyy, yyyy-mm-dd, dd/mm/yyyy, yyyy/mm/dd
 */
function formatDate(dateString) {
    if (!dateString) return '-';
    
    try {
        // Remove any time part if present
        const datePart = dateString.split(' ')[0];
        const monthNames = [
            'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
            'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
        ];
        
        // Try dash separator first (dd-mm-yyyy or yyyy-mm-dd)
        const dashParts = datePart.split('-');
        if (dashParts.length === 3) {
            // Determine if format is dd-mm-yyyy or yyyy-mm-dd
            // If first part is 4 digits, assume yyyy-mm-dd
            if (dashParts[0].length === 4) {
                // yyyy-mm-dd -> convert to dd Mmm yyyy
                const [year, month, day] = dashParts;
                const monthIndex = parseInt(month, 10) - 1;
                const monthName = monthNames[monthIndex] || month;
                return `${day} ${monthName} ${year}`;
            } else {
                // dd-mm-yyyy
                const [day, month, year] = dashParts;
                const monthIndex = parseInt(month, 10) - 1;
                const monthName = monthNames[monthIndex] || month;
                return `${day} ${monthName} ${year}`;
            }
        }
        
        // Try slash separator (dd/mm/yyyy or yyyy/mm/dd)
        const slashParts = datePart.split('/');
        if (slashParts.length === 3) {
            // Determine if format is dd/mm/yyyy or yyyy/mm/dd
            if (slashParts[0].length === 4) {
                // yyyy/mm/dd -> convert to dd Mmm yyyy
                const [year, month, day] = slashParts;
                const monthIndex = parseInt(month, 10) - 1;
                const monthName = monthNames[monthIndex] || month;
                return `${day} ${monthName} ${year}`;
            } else {
                // dd/mm/yyyy
                const [day, month, year] = slashParts;
                const monthIndex = parseInt(month, 10) - 1;
                const monthName = monthNames[monthIndex] || month;
                return `${day} ${monthName} ${year}`;
            }
        }
        
        // Return original if no pattern matched
        return dateString;
    } catch (error) {
        console.warn('Error formatting date:', dateString, error);
        return dateString;
    }
}

// ============================================
// END UTILITY FUNCTIONS
// ============================================

/**
 * Initialize Database Kualitas Air page
 * Called by router after HTML is loaded
 */
export function initDatabaseKualitasAir() {
    console.log("🚀 Database Kualitas Air module loaded.");
    
    // Setup event listeners
    setupBasicEventListeners();
    
    // Fase 3: Load real data from database
    loadData();
    
    console.log("✅ Database page initialized (Fase 3: Real data fetching)");
}

/**
 * Setup basic event listeners for Fase 1
 */
function setupBasicEventListeners() {
    console.log("Setting up basic event listeners...");
    
    // Refresh button
    const btnRefresh = document.getElementById('btnRefresh');
    if (btnRefresh) {
        btnRefresh.addEventListener('click', () => {
            console.log("Refresh button clicked - loading real data from database");
            loadData();
        });
    }
    
    // Export All button
    const btnExportAll = document.getElementById('btnExportAll');
    if (btnExportAll) {
        btnExportAll.addEventListener('click', () => {
            console.log("Export All button clicked (functionality coming in Fase 5)");
            alert("Export All functionality will be implemented in Fase 5");
        });
    }
    
    // Go to Input button (empty state)
    const btnGoToInput = document.getElementById('btnGoToInput');
    if (btnGoToInput) {
        btnGoToInput.addEventListener('click', () => {
            console.log("Go to Input button clicked - navigating to kualitas-air page");
            // Navigate to input page by clicking the sidebar button
            const navKualitasAir = document.getElementById('nav-kualitas-air');
            if (navKualitasAir) {
                navKualitasAir.click();
            } else {
                alert("Navigation error: Input page button not found");
            }
        });
    }
    
    // Retry button (error state)
    const btnRetry = document.getElementById('btnRetry');
    if (btnRetry) {
        btnRetry.addEventListener('click', () => {
            console.log("Retry button clicked - loading real data from database");
            loadData();
        });
    }
    
    // Go to Input button (error state)
    const btnGoToInputFromError = document.getElementById('btnGoToInputFromError');
    if (btnGoToInputFromError) {
        btnGoToInputFromError.addEventListener('click', () => {
            console.log("Go to Input from Error button clicked - navigating to kualitas-air page");
            const navKualitasAir = document.getElementById('nav-kualitas-air');
            if (navKualitasAir) {
                navKualitasAir.click();
            } else {
                alert("Navigation error: Input page button not found");
            }
        });
    }
    
    // Modal close buttons
    const btnCloseModal = document.getElementById('btnCloseModal');
    const btnCloseModal2 = document.getElementById('btnCloseModal2');
    
    if (btnCloseModal) {
        btnCloseModal.addEventListener('click', () => {
            console.log("Modal close button clicked (modal functionality coming in Fase 4)");
            hideModal();
        });
    }
    
    if (btnCloseModal2) {
        btnCloseModal2.addEventListener('click', () => {
            console.log("Modal close button 2 clicked (modal functionality coming in Fase 4)");
            hideModal();
        });
    }
    
    // Export Record button (in modal)
    const btnExportRecord = document.getElementById('btnExportRecord');
    if (btnExportRecord) {
        btnExportRecord.addEventListener('click', () => {
            console.log("Export Record button clicked (functionality coming in Fase 5)");
            alert("Export Record functionality will be implemented in Fase 5");
        });
    }
    
    console.log("✅ Basic event listeners setup complete");
}

/**
 * Show modal (placeholder for Fase 4)
 */
function showModal() {
    console.log("Show modal called (implementation in Fase 4)");
    const modal = document.getElementById('detailModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

/**
 * Hide modal (placeholder for Fase 4)
 */
function hideModal() {
    console.log("Hide modal called (implementation in Fase 4)");
    const modal = document.getElementById('detailModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

/**
 * Load data from database
 * Fase 3: Implement real data fetching from Rust backend
 */
async function loadData() {
    console.log("Load data called - fetching from database...");
    
    try {
        showLoading();
        
        // Call Rust backend to get all data
        const rawData = await invoke('get_all_kualitas_air');
        console.log(`✅ Raw data fetched successfully: ${rawData.length} records`);
        
        // Fase 3 Step 2: Transform data for display
        const transformedData = transformData(rawData);
        console.log(`✅ Data transformed: ${transformedData.length} records ready for display`);
        
        // Render the transformed data
        renderCards(transformedData);
        
        return transformedData;
        
    } catch (error) {
        console.error("❌ Error loading data:", error);
        
        // Show error state in UI (which also hides loading)
        showErrorState(error);
        
        // Show alert to user as requested
        alert(`❌ Gagal memuat data dari database:\n${error}`);
        
        // Return empty array to prevent further errors
        return [];
    }
}

/**
 * Render cards from data
 * Fase 2: Implement card rendering with dummy data
 */
function renderCards(data) {
    console.log("Render cards called with", data.length, "records");
    
    // Hide loading state
    hideLoading();
    
    // Update record count
    const recordCount = document.getElementById('recordCount');
    if (recordCount) {
        recordCount.textContent = data.length;
    }
    
    // If no data, show empty state
    if (!data || data.length === 0) {
        showEmptyState();
        return;
    }
    
    // Clear and populate cards grid
    const cardsGrid = document.getElementById('cardsGrid');
    if (cardsGrid) {
        cardsGrid.innerHTML = '';
        
        // Create cards for each record
        data.forEach((record, index) => {
            const card = createCardElement(record, index);
            cardsGrid.appendChild(card);
        });
        
        // Show cards grid and hide other states
        cardsGrid.style.display = 'grid';
        const emptyState = document.getElementById('emptyState');
        const errorState = document.getElementById('errorState');
        if (emptyState) emptyState.style.display = 'none';
        if (errorState) errorState.style.display = 'none';
    }
    
    // Update stats
    updateStats(data);
}

/**
 * Create card element for a single record
 * Updated for Fase 3: Uses transformed data fields
 */
function createCardElement(record, index) {
    const card = document.createElement('div');
    card.className = 'db-card';
    card.dataset.id = record.id || index;
    
    // Use transformed display fields (created by transformData)
    const namaPos = record.display_nama_pos || `Data ${index + 1}`;
    const lokasi = record.display_lokasi || '-';
    const pelaksana = record.display_pelaksana || '-';
    const tanggal = record.display_tanggal || '-';
    const waktu = record.display_waktu || '';
    
    // Get status info using both status_ip and nilai_ip for color coding
    // Use fallback for field names (Rust uses mixed naming)
    const statusIp = record.status_ip || record.statusIp;
    const nilaiIp = record.nilai_ip || record.nilaiIp;
    const statusInfo = getStatusInfo(statusIp, nilaiIp);
    const ipScore = record.display_nilai_ip || '-';
    
    // Card HTML structure using transformed fields
    card.innerHTML = `
        <div class="db-card-header">
            <div class="db-card-title">
                <span>${namaPos}</span>
                <span class="db-card-badge ${statusInfo.colorClass}">${statusInfo.text}</span>
            </div>
            <div class="db-card-subtitle">
                <small><i class="fas fa-calendar"></i> ${tanggal}</small>
                ${waktu ? `<small><i class="fas fa-clock"></i> ${waktu}</small>` : ''}
            </div>
        </div>
        <div class="db-card-body">
            <div class="db-card-row">
                <span class="db-card-label">Lokasi:</span>
                <span class="db-card-value">${lokasi}</span>
            </div>
            <div class="db-card-row">
                <span class="db-card-label">IP Score:</span>
                <span class="db-card-value" style="font-weight: 700; color: ${statusInfo.color}">${ipScore}</span>
            </div>
            <div class="db-card-row">
                <span class="db-card-label">Pelaksana:</span>
                <span class="db-card-value">${pelaksana}</span>
            </div>
        </div>
        <div class="db-card-actions">
            <button class="db-card-btn db-card-btn-detail" data-id="${record.id || index}">
                <i class="fas fa-info-circle"></i> Detail
            </button>
            <button class="db-card-btn db-card-btn-export" data-id="${record.id || index}">
                <i class="fas fa-file-export"></i> Export
            </button>
            <button class="db-card-btn db-card-btn-delete" data-id="${record.id || index}">
                <i class="fas fa-trash"></i> Hapus
            </button>
        </div>
    `;
    
    // Add event listeners to buttons
    const detailBtn = card.querySelector('.db-card-btn-detail');
    const exportBtn = card.querySelector('.db-card-btn-export');
    
    if (detailBtn) {
        detailBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            console.log("Detail button clicked for record:", record.id || index);
            showCardDetail(record);
        });
    }
    
    if (exportBtn) {
        exportBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            console.log("Export button clicked for record:", record.id || index);
            alert("Export functionality will be implemented in Fase 5");
        });
    }
    
    // Delete button
    const deleteBtn = card.querySelector('.db-card-btn-delete');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            console.log("Delete button clicked for record:", record.id || index);
            if (await window.confirm("Yakin ingin menghapus?"))
            {
                await deleteRecord(record.id, card);
            }
            else
            {
                alert("Penghapusan entry dibatalkan.");
            }
        });
    }
    
    return card;
}





/**
 * Delete a record from database and UI
 * @param {number} recordId - ID of the record to delete
 * @param {HTMLElement} cardElement - The card DOM element to remove
 */
async function deleteRecord(recordId, cardElement) {
    if (!recordId) {
        console.error("Cannot delete record: ID is missing");
        alert("❌ Gagal menghapus: ID data tidak valid");
        return;
    }

    try
    {
        console.log(`🗑️  Deleting record ID: ${recordId}`);
        
        // Call Rust backend to delete
        const result = await invoke('delete_kualitas_air', { id: recordId });
        console.log(`✅ Delete successful:`, result);
        
        // Remove card from UI with animation
        cardElement.style.opacity = '0.5';
        cardElement.style.transform = 'scale(0.95)';
        cardElement.style.transition = 'all 0.3s ease';
        
        setTimeout(() => {
            cardElement.remove();
            
            // Update stats and record count
            const cardsGrid = document.getElementById('cardsGrid');
            if (cardsGrid) {
                const remainingCards = cardsGrid.querySelectorAll('.db-card');
                const recordCount = document.getElementById('recordCount');
                if (recordCount) {
                    recordCount.textContent = remainingCards.length;
                }
                
                // Reload data to refresh stats (or we could update stats directly)
                if (remainingCards.length === 0) {
                    showEmptyState();
                } else {
                    // We need to update stats based on remaining data
                    // For simplicity, reload all data
                    loadData();
                }
            }
            
            // Show success message
            alert(`✅ Data berhasil dihapus\n${result}`);
            
        }, 300);
    }
    catch (error)
    {
        console.error("❌ Error deleting record:", error);
        alert(`❌ Gagal menghapus data:\n${error}`);
    }
}

/**
 * Show detail for a card (placeholder for modal in Fase 4)
 */
function showCardDetail(record) {
    console.log("Show card detail for:", record.nama_pos || record.id);
    alert(`Detail for: ${record.nama_pos || 'Record'}\n\nThis modal will be implemented in Fase 4 with full 47+ field display.`);
}

/**
 * Render dummy data for Fase 2 UI testing
 */
function renderDummyData() {
    console.log("Rendering dummy data for UI testing...");
    
    const dummyData = generateDummyData();
    renderCards(dummyData);
}

/**
 * Generate dummy data for testing UI
 */
function generateDummyData() {
    const statuses = [
        'Memenuhi Baku Mutu',
        'Cemar Ringan', 
        'Cemar Sedang',
        'Cemar Berat',
        'Memenuhi Baku Mutu',
        'Cemar Ringan'
    ];
    
    const locations = [
        'Pos AWLR Tamboli',
        'Pos DAS Bengawan Solo',
        'Pos Kali Code',
        'Pos Sungai Brantas',
        'Pos DAS Musi',
        'Pos Sungai Kapuas'
    ];
    
    const provinces = ['Jawa Barat', 'Jawa Tengah', 'DI Yogyakarta', 'Jawa Timur', 'Sumatera Selatan', 'Kalimantan Barat'];
    const dates = ['15-01-2025', '20-01-2025', '25-01-2025', '30-01-2025', '05-02-2025', '10-02-2025'];
    const times = ['08:30', '09:15', '10:00', '11:45', '13:20', '14:30'];
    const labs = ['Lab Lingkungan PUPR', 'Lab Kesehatan', 'Lab BPPT', 'Lab Universitas', 'Lab DLH Provinsi', 'Lab Swasta'];
    
    return Array.from({ length: 6 }, (_, i) => ({
        id: i + 1,
        nama_pos: locations[i],
        das: `DAS ${locations[i].split(' ').pop()}`,
        provinsi: provinces[i],
        kabupaten: `Kab. ${provinces[i].split(' ').pop()}`,
        tanggal_sampling: dates[i],
        waktu_sampling: times[i],
        pelaksana: `Tim ${labs[i].split(' ')[1] || 'PUPR'}`,
        laboratorium: labs[i],
        sungai: locations[i].includes('Sungai') ? locations[i] : `Sungai ${locations[i].split(' ').pop()}`,
        nilai_ip: getRandomScore(statuses[i]),
        status_ip: statuses[i],
        temperatur: 25 + Math.random() * 5,
        ph: 6.5 + Math.random() * 2.5,
        oksigen: 4 + Math.random() * 4,
        bod: Math.random() * 5,
        cod: Math.random() * 30,
        tss: Math.random() * 100,
        created_at: new Date().toISOString()
    }));
}

/**
 * Get random IP score based on status
 */
function getRandomScore(status) {
    if (status.includes('Memenuhi')) return 0.5 + Math.random() * 0.5;
    if (status.includes('Ringan')) return 1.5 + Math.random() * 3.5;
    if (status.includes('Sedang')) return 5.5 + Math.random() * 4.5;
    if (status.includes('Berat')) return 10.5 + Math.random() * 5;
    return Math.random() * 15;
}

/**
 * Show loading state
 */
function showLoading() {
    const loadingContainer = document.querySelector('.loading-container');
    const cardsGrid = document.getElementById('cardsGrid');
    const emptyState = document.getElementById('emptyState');
    const errorState = document.getElementById('errorState');
    
    if (loadingContainer) loadingContainer.style.display = 'block';
    if (cardsGrid) cardsGrid.style.display = 'none';
    if (emptyState) emptyState.style.display = 'none';
    if (errorState) errorState.style.display = 'none';
    
    // Show loading cursor on body
    document.body.style.cursor = 'wait';
}

/**
 * Hide loading state
 */
function hideLoading() {
    const loadingContainer = document.querySelector('.loading-container');
    if (loadingContainer) loadingContainer.style.display = 'none';
    
    // Restore default cursor
    document.body.style.cursor = 'default';
}

/**
 * Show empty state
 */
function showEmptyState() {
    const loadingContainer = document.querySelector('.loading-container');
    const cardsGrid = document.getElementById('cardsGrid');
    const emptyState = document.getElementById('emptyState');
    const errorState = document.getElementById('errorState');
    
    if (loadingContainer) loadingContainer.style.display = 'none';
    if (cardsGrid) cardsGrid.style.display = 'none';
    if (emptyState) emptyState.style.display = 'block';
    if (errorState) errorState.style.display = 'none';
    
    // Update record count to 0
    const recordCount = document.getElementById('recordCount');
    if (recordCount) recordCount.textContent = '0';
    
    // Reset stats
    document.querySelectorAll('.stat-value').forEach(el => {
        el.textContent = '0';
    });
}

/**
 * Show error state with improved error display
 * Fase 3 Step 3: Enhanced error management
 */
function showErrorState(error) {
    const loadingContainer = document.querySelector('.loading-container');
    const cardsGrid = document.getElementById('cardsGrid');
    const emptyState = document.getElementById('emptyState');
    const errorState = document.getElementById('errorState');
    const errorTitle = document.getElementById('errorTitle');
    const errorMessage = document.getElementById('errorMessage');
    const errorDetail = document.getElementById('errorDetail');
    const errorSolution = document.getElementById('errorSolution');
    
    if (loadingContainer) loadingContainer.style.display = 'none';
    if (cardsGrid) cardsGrid.style.display = 'none';
    if (emptyState) emptyState.style.display = 'none';
    if (errorState) errorState.style.display = 'block';
    
    if (error) {
        const errorStr = String(error);
        let title = 'Gagal Memuat Data';
        let message = errorStr;
        let detail = '';
        let solution = 'Coba muat ulang halaman atau periksa koneksi database.';
        
        // Classify errors for better user guidance
        if (errorStr.includes('database') || errorStr.includes('SQL') || errorStr.includes('query')) {
            title = 'Database Error';
            detail = 'Terjadi kesalahan saat mengakses database. Pastikan database sudah dibuat dan tabel tersedia.';
            solution = 'Periksa console untuk detail error atau jalankan setup database terlebih dahulu.';
        } else if (errorStr.includes('network') || errorStr.includes('connection') || errorStr.includes('fetch')) {
            title = 'Koneksi Error';
            detail = 'Tidak dapat terhubung ke backend Rust. Pastikan aplikasi berjalan dengan benar.';
            solution = 'Restart aplikasi atau periksa apakah backend Rust sedang berjalan.';
        } else if (errorStr.includes('timeout') || errorStr.includes('time out')) {
            title = 'Timeout Error';
            detail = 'Permintaan data memakan waktu terlalu lama.';
            solution = 'Coba muat ulang atau periksa kinerja database.';
        }
        
        // Update error UI elements
        if (errorTitle) errorTitle.textContent = title;
        if (errorMessage) errorMessage.textContent = message.length > 150 ? message.substring(0, 150) + '...' : message;
        if (errorDetail) errorDetail.textContent = detail;
        if (errorSolution) errorSolution.textContent = solution;
        
        // Log detailed error for debugging
        console.error('Error details:', {
            raw: error,
            message: error.message,
            stack: error.stack,
            classified: { title, detail, solution }
        });
    }
    
    // Restore cursor
    document.body.style.cursor = 'default';
}

/**
 * Update stats bar with data counts
 */
function updateStats(data) {
    console.log("Update stats with", data.length, "records");
    
    if (!data || data.length === 0) {
        // Reset all stats to 0
        document.querySelectorAll('.stat-value').forEach(el => {
            el.textContent = '0';
        });
        return;
    }
    
    // Count status categories
    const counts = {
        total: data.length,
        good: 0,
        light: 0,
        medium: 0,
        heavy: 0
    };
    
    data.forEach(record => {
        const statusRaw = record.status_ip || record.statusIp;
        const status = statusRaw ? statusRaw.toLowerCase() : '';
        if (status.includes('memenuhi')) counts.good++;
        else if (status.includes('ringan')) counts.light++;
        else if (status.includes('sedang')) counts.medium++;
        else if (status.includes('berat')) counts.heavy++;
    });
    
    // Update DOM elements
    const statElements = document.querySelectorAll('.stat-value');
    if (statElements.length >= 5) {
        statElements[0].textContent = counts.total;
        statElements[1].textContent = counts.good;
        statElements[2].textContent = counts.light;
        statElements[3].textContent = counts.medium;
        statElements[4].textContent = counts.heavy;
    }
}

// Export additional functions if needed for testing
export const __testing__ = {
    setupBasicEventListeners,
    showModal,
    hideModal,
    loadData,
    renderCards
};