-- stations table (pos pemantauan)
CREATE TABLE IF NOT EXISTS stations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- water_quality_measurements table
CREATE TABLE IF NOT EXISTS water_quality_measurements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    station_id INTEGER NOT NULL,
    sampling_date TEXT NOT NULL,
    sampling_time TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE
);

-- Create indexes untuk performance
CREATE INDEX IF NOT EXISTS idx_measurements_station_id ON water_quality_measurements(station_id);
CREATE INDEX IF NOT EXISTS idx_measurements_date ON water_quality_measurements(sampling_date);
CREATE INDEX IF NOT EXISTS idx_stations_name ON stations(name);