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

    // 3. Create shown_properties table
    await sql`
      CREATE TABLE IF NOT EXISTS shown_properties (
        id SERIAL PRIMARY KEY,
        client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
        property_id INTEGER REFERENCES properties(id) ON DELETE SET NULL,
        custom_title TEXT,
        shown_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        notes TEXT,
        result VARCHAR(50) DEFAULT 'pending'
      )
    `;

    // Self-healing database migrations for existing schemas:
    // A. Add custom_title column if it doesn't exist
    await sql`
      ALTER TABLE shown_properties 
      ADD COLUMN IF NOT EXISTS custom_title TEXT
    `;

    // B. Drop NOT NULL constraint on property_id
    await sql`
      ALTER TABLE shown_properties 
      ALTER COLUMN property_id DROP NOT NULL
    `;

    // C. Drop the UNIQUE constraint on (client_id, property_id) if it exists
    await sql`
      ALTER TABLE shown_properties 
      DROP CONSTRAINT IF EXISTS shown_properties_client_id_property_id_key
    `;

    // D. Drop and recreate property_id foreign key constraint with ON DELETE SET NULL
    try {
      await sql`
        ALTER TABLE shown_properties 
        DROP CONSTRAINT IF EXISTS shown_properties_property_id_fkey
      `;
      await sql`
        ALTER TABLE shown_properties 
        ADD CONSTRAINT shown_properties_property_id_fkey 
        FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE SET NULL
      `;
    } catch (fkErr) {
      console.warn('Could not alter foreign key for shown_properties:', fkErr);
    }

    isInitialized = true;
    console.log('Database initialized successfully with self-healing tables.');
  } catch (error) {
    console.error('Failed to initialize database tables:', error);
    throw error;
  }
}
