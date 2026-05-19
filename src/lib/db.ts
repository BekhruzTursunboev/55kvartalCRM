import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is missing from .env');
}

// Create Neon sql client
export const sql = neon(process.env.DATABASE_URL);

let isInitialized = false;

export async function initDb() {
  if (isInitialized) return;

  try {
    // 1. Create properties table
    await sql`
      CREATE TABLE IF NOT EXISTS properties (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        category VARCHAR(50) NOT NULL,
        type VARCHAR(100) NOT NULL,
        deal_type VARCHAR(50) NOT NULL,
        price NUMERIC NOT NULL,
        rayon VARCHAR(100) NOT NULL,
        orientir TEXT,
        rooms INTEGER,
        area NUMERIC NOT NULL,
        floor INTEGER,
        max_floor INTEGER,
        details JSONB DEFAULT '{}',
        contact_name TEXT,
        contact_phone TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // 2. Create clients table
    await sql`
      CREATE TABLE IF NOT EXISTS clients (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        category VARCHAR(50) NOT NULL,
        type VARCHAR(100),
        deal_type VARCHAR(50) NOT NULL,
        price_min NUMERIC DEFAULT 0,
        price_max NUMERIC NOT NULL,
        rayons JSONB DEFAULT '[]',
        orientir TEXT,
        min_area NUMERIC DEFAULT 0,
        rooms VARCHAR(50),
        details JSONB DEFAULT '{}',
        notes TEXT,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    isInitialized = true;
    console.log('Database initialized successfully with self-healing tables.');
  } catch (error) {
    console.error('Failed to initialize database tables:', error);
    throw error;
  }
}
