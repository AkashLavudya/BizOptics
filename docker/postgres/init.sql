-- PostgreSQL initialization script
-- This runs when the container is first created

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "citext";

-- Create database if not exists (handled by POSTGRES_DB env var)
-- Additional setup can go here
