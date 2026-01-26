use thiserror::Error;

#[derive(Error, Debug)]
pub enum AppError {
    #[error("Kesalahan database: {0}")]
    DatabaseError(String),

    #[error("Data tidak valid: {0}")]
    ValidationError(String),

    #[error("File tidak ditemukan: {0}")]
    FileNotFound(String),

    #[error("Operasi gagal: {0}")]
    OperationFailed(String),

    #[error("Parameter wajib tidak diisi: {0}")]
    RequiredFieldMissing(String),

    #[error("Format data tidak sesuai: {0}")]
    InvalidFormat(String),

    #[error("Data sudah ada: {0}")]
    DuplicateData(String),
}

pub type Result<T> = std::result::Result<T, AppError>;
