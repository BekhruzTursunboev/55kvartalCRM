import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';

// Read .env manually
const envContent = fs.readFileSync(path.join(process.cwd(), '.env'), 'utf8');
const match = envContent.match(/DATABASE_URL=["']?([^"'\s]+)["']?/);
if (!match) {
  console.error("No DATABASE_URL found in .env");
  process.exit(1);
}
const databaseUrl = match[1];

const sql = neon(databaseUrl);

async function run() {
  try {
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log("TABLES IN DATABASE:", tables);
    
    for (const t of tables) {
      const name = t.table_name;
      const countRes = await sql.query(`SELECT COUNT(*) as count FROM ${name}`);
      console.log(`Table ${name} query result:`, countRes);
    }
  } catch (err) {
    console.error("Error listing tables:", err);
  }
}

run();
