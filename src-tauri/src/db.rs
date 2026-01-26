use sqlx::{SqlitePool, sqlite::SqliteConnectOptions};
use std::str::FromStr;

pub async fn init_db() -> anyhow::Result<SqlitePool> {
    // Create database directory if it doesn't exist
    std::fs::create_dir_all("data")?;
    
    let database_url = "sqlite:./data/hidrologi.db";
    
    let connect_options = SqliteConnectOptions::from_str(database_url)?
        .create_if_missing(true);
    
    let pool = SqlitePool::connect_with(connect_options).await?;
    
    // Run migrations
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS water_quality_samples (
            id TEXT PRIMARY KEY,
            sample_date TEXT NOT NULL,
            sample_time TEXT NOT NULL,
            location_name TEXT NOT NULL,
            das TEXT NOT NULL,
            river_basin TEXT NOT NULL,
            province TEXT NOT NULL,
            regency TEXT NOT NULL,
            district TEXT NOT NULL,
            year INTEGER NOT NULL,
            elevation TEXT,
            operator TEXT NOT NULL,
            laboratory TEXT NOT NULL,
            river TEXT NOT NULL,
            village TEXT NOT NULL,
            coordinates TEXT,
            
            -- Variabel Umum
            temperatur TEXT,
            konduktivitas TEXT,
            kekeruhan TEXT,
            oksigen TEXT,
            ph TEXT,
            tds TEXT,
            tss TEXT,
            warna TEXT,
            
            -- Major Ion
            klorida TEXT,
            
            -- Nutrient
            amoniak TEXT,
            nitrat TEXT,
            nitrit TEXT,
            fosfat TEXT,
            deterjen TEXT,
            
            -- Kontaminan Logam Berat
            arsen TEXT,
            besi TEXT,
            mangan TEXT,
            tembaga TEXT,
            merkuri TEXT,
            
            -- Kontaminan Anorganik
            sianida TEXT,
            fluorida TEXT,
            belerang TEXT,
            
            -- Kontaminan Organik
            cod TEXT,
            bod TEXT,
            minyak_dan_lemak TEXT,
            fenol TEXT,
            
            -- Mikrobiologi
            total_coliform TEXT,
            
            -- Lain-lain
            debit TEXT,
            
            -- Timestamps
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE INDEX IF NOT EXISTS idx_sample_date ON water_quality_samples(sample_date);
        CREATE INDEX IF NOT EXISTS idx_location_name ON water_quality_samples(location_name);
        CREATE INDEX IF NOT EXISTS idx_year ON water_quality_samples(year);
        "#,
    )
    .execute(&pool)
    .await?;
    
    println!("✅ Database initialized successfully");
    
    Ok(pool)
}