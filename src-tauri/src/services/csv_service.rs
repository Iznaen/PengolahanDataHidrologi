use crate::models::kualitas_air::KualitasAirRecord;
use std::fs::File;

pub fn export_to_csv(data: &Vec<KualitasAirRecord>, file_path: &str) -> Result<(), String>
{
    // 1. coba buat file di path yang diminta
    let file = File::create(file_path)
        .map_err(|e| format!("Gagal membuat file: {}", e))?;

    // 2. init csv writer
    let mut wtr = csv::Writer::from_writer(file);

    // 3. loop dan tulis setiap record
    for record in data
    {
        wtr.serialize(record)
            .map_err(|e| format!("Gagal menulis baris data: {}", e))?;
    }

    // 4. flush buffer untuk memastikan semua data tertulis
    wtr.flush()
        .map_err(|e| format!("Gagal menyimpan file .csv: {}", e))?;

    Ok(())
}