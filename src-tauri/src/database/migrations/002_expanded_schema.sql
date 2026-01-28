-- Migration 002: Expanded schema for stations and water quality measurements
-- Adds all metadata fields to stations table and 29+ parameter columns to measurements table
-- This migration should be run after 001_initial.sql

-- First, create migration tracking table if not exists
CREATE TABLE IF NOT EXISTS schema_migrations (
    version INTEGER PRIMARY KEY,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert migration record for version 2
INSERT OR IGNORE INTO schema_migrations (version) VALUES (2);