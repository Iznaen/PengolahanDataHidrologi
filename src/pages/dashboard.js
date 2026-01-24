export function dashboardPage()
{
    const dashboardHTML = createPage();
    return dashboardHTML;
}

export function dashboardEvents()
{
}

function createPage()
{
    return `
    <div class="dashboard-wrapper">
        <div class="dashboard-header">
            <h1 class="dashboard-title">Selamat Datang</h1>
            <p class="dashboard-subtitle">Aplikasi Pengolahan Data Hidrologi</p>
            <div class="dashboard-info">
                <div class="info-item">
                    <i class="fas fa-building"></i>
                    <span>Unit Kerja Hidrologi dan Kualitas Air</span>
                </div>
                <div class="info-item">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>BWS Sulawesi IV Kendari</span>
                </div>
            </div>
        </div>

        <div class="dashboard-content">
            <!-- Quick Access Section -->
            <div class="quick-access-section">
                <h2 class="section-title">
                    <i class="fas fa-bolt"></i>
                    <span>Akses Cepat</span>
                </h2>
                <div class="quick-access-grid">
                    <button class="quick-access-card" id="inputDataBtn">
                        <div class="card-icon">
                            <i class="fas fa-laptop"></i>
                        </div>
                        <h3>Input Data Hidrologi</h3>
                        <p>Masukkan data pengukuran terbaru</p>
                        <span class="card-arrow">→</span>
                    </button>
                    
                    <button class="quick-access-card" id="laporanBtn">
                        <div class="card-icon">
                            <i class="fas fa-newspaper"></i>
                        </div>
                        <h3>Laporan</h3>
                        <p>Generate laporan periodik</p>
                        <span class="card-arrow">→</span>
                    </button>
                    
                    <button class="quick-access-card" id="ruangDataBtn">
                        <div class="card-icon">
                            <i class="fas fa-server"></i>
                        </div>
                        <h3>Ruang Data</h3>
                        <p>Akses database dan arsip</p>
                        <span class="card-arrow">→</span>
                    </button>
                </div>
            </div>

            <!-- History Section -->
            <div class="history-section">
                <h2 class="section-title">
                    <i class="fas fa-history"></i>
                    <span>Riwayat Aktivitas Terbaru</span>
                </h2>
                <div class="history-list" id="historyList">
                    <div class="history-item">
                        <div class="history-icon success">
                            <i class="fas fa-plus"></i>
                        </div>
                        <div class="history-content">
                            <p><strong>Mira</strong> menginput data kualitas air Sungai Wanggu</p>
                            <span class="history-time">Hari ini, 10:30 WITA</span>
                        </div>
                    </div>
                    
                    <div class="history-item">
                        <div class="history-icon edit">
                            <i class="fas fa-edit"></i>
                        </div>
                        <div class="history-content">
                            <p><strong>Suherman</strong> mengedit data curah hujan bulan Oktober</p>
                            <span class="history-time">Kemarin, 14:45 WITA</span>
                        </div>
                    </div>
                    
                    <div class="history-item">
                        <div class="history-icon report">
                            <i class="fas fa-file-pdf"></i>
                        </div>
                        <div class="history-content">
                            <p><strong>Anita</strong> mengekspor laporan triwulan III 2024</p>
                            <span class="history-time">2 hari lalu, 09:15 WITA</span>
                        </div>
                    </div>
                </div>
                <button class="btn-view-all" id="viewAllHistoryBtn">
                    <span>Lihat Semua Riwayat</span>
                    <i class="fas fa-arrow-right"></i>
                </button>
            </div>

            <!-- Stats Overview -->
            <div class="stats-section">
                <h2 class="section-title">
                    <i class="fas fa-chart-bar"></i>
                    <span>Gambaran Data</span>
                </h2>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-header">
                            <i class="fas fa-flask"></i>
                            <h3>Data Kualitas Air</h3>
                        </div>
                        <div class="stat-body">
                            <div class="stat-value">1.248</div>
                            <div class="stat-label">Entri Data</div>
                        </div>
                        <div class="stat-footer">
                            <span class="stat-trend positive">
                                <i class="fas fa-arrow-up"></i>
                                12% bulan lalu
                            </span>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-header">
                            <i class="fas fa-cloud-rain"></i>
                            <h3>Data Curah Hujan</h3>
                        </div>
                        <div class="stat-body">
                            <div class="stat-value">856</div>
                            <div class="stat-label">Pengukuran</div>
                        </div>
                        <div class="stat-footer">
                            <span class="stat-trend neutral">
                                <i class="fas fa-minus"></i>
                                Tidak berubah
                            </span>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-header">
                            <i class="fas fa-users"></i>
                            <h3>Aktivitas Pengguna</h3>
                        </div>
                        <div class="stat-body">
                            <div class="stat-value">28</div>
                            <div class="stat-label">Aktivitas Hari Ini</div>
                        </div>
                        <div class="stat-footer">
                            <span class="stat-trend positive">
                                <i class="fas fa-arrow-up"></i>
                                3 dari kemarin
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- App Version Footer -->
        <div class="dashboard-footer">
            <div class="version-info">
                <i class="fas fa-code-branch"></i>
                <span>Version: v0.0.1</span>
            </div>
            <div class="footer-links">
                <a href="#" class="footer-link">Bantuan</a>
                <span class="divider">•</span>
                <a href="#" class="footer-link">Kebijakan Privasi</a>
                <span class="divider">•</span>
                <a href="#" class="footer-link">Kontak</a>
            </div>
        </div>
    </div>
    `;
}