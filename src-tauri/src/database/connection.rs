use r2d2::{Pool, PooledConnection};
use r2d2_sqlite::SqliteConnectionManager;
use rusqlite::OpenFlags;
use tauri::{AppHandle, Manager};

use crate::errors::{AppError, Result};

pub type DbPool = Pool<SqliteConnectionManager>;
pub type DbConnection = PooledConnection<SqliteConnectionManager>;

pub struct Database {
    pool: DbPool,
}

impl Database {
    pub fn new(app_handle: &AppHandle) -> Result<Self> {
        // Gunakan app data directory
        let app_dir = app_handle.path().app_data_dir().map_err(|e| {
            AppError::DatabaseError(format!("Gagal mendapatkan app data directory: {}", e))
        })?;

        std::fs::create_dir_all(&app_dir).map_err(|e| {
            AppError::DatabaseError(format!("Gagal membuat app data directory: {}", e))
        })?;

        let db_path = app_dir.join("datahidrologi.db");
        println!("📁 Database path: {:?}", db_path);
        let manager = SqliteConnectionManager::file(db_path)
            .with_flags(OpenFlags::SQLITE_OPEN_READ_WRITE | OpenFlags::SQLITE_OPEN_CREATE);

        let pool = Pool::builder().max_size(5).build(manager).map_err(|e| {
            AppError::DatabaseError(format!("Gagal membuat connection pool: {}", e))
        })?;

        let db = Self { pool };

        // Jalankan migrations
        db.run_migrations()?;

        Ok(db)
    }

    pub fn get_connection(&self) -> Result<DbConnection> {
        self.pool.get().map_err(|e| {
            AppError::DatabaseError(format!("Gagal mendapatkan koneksi database: {}", e))
        })
    }

    fn run_migrations(&self) -> Result<()> {
        let conn = self.get_connection()?;

        // TODO: Implement proper migration system
        // Untuk sekarang, buat table jika belum ada
        println!("🔧 Menjalankan database migrations...");
        conn.execute_batch(include_str!("migrations/001_initial.sql"))
            .map_err(|e| AppError::DatabaseError(format!("Gagal menjalankan migrations: {}", e)))?;

        println!("✅ Database migrations berhasil");

        Ok(())
    }
}
