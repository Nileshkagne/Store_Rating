// Database setup script - creates database, schema, and seed data
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function setup() {
  // Connect to default 'postgres' database to create our database
  const adminPool = new Pool({
    user: 'postgres',
    password: 'password',
    host: 'localhost',
    port: 5432,
    database: 'postgres',
  });

  try {
    console.log('Checking if store_rating database exists...');
    const dbCheck = await adminPool.query(
      "SELECT 1 FROM pg_database WHERE datname = 'store_rating'"
    );

    if (dbCheck.rows.length === 0) {
      console.log('Creating store_rating database...');
      await adminPool.query('CREATE DATABASE store_rating');
      console.log('Database created!');
    } else {
      console.log('Database already exists.');
    }
  } catch (err) {
    console.error('Error creating database:', err.message);
    console.log('\n** If authentication fails, update the password in .env and this script to match your PostgreSQL password **\n');
    process.exit(1);
  } finally {
    await adminPool.end();
  }

  // Connect to store_rating database and run schema + seed
  const appPool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/store_rating',
  });

  try {
    console.log('Running schema.sql...');
    const schema = fs.readFileSync(path.join(__dirname, '../database/schema.sql'), 'utf8');
    await appPool.query(schema);
    console.log('Schema created!');

    console.log('Running seed.sql...');
    const seed = fs.readFileSync(path.join(__dirname, '../database/seed.sql'), 'utf8');
    await appPool.query(seed);
    console.log('Seed data inserted!');

    // Verify
    const users = await appPool.query('SELECT id, name, email, role FROM users ORDER BY id');
    console.log('\nUsers:');
    users.rows.forEach(u => console.log(`  ${u.id}: ${u.name} (${u.email}) - ${u.role}`));

    const stores = await appPool.query('SELECT id, name, owner_id FROM stores ORDER BY id');
    console.log('\nStores:');
    stores.rows.forEach(s => console.log(`  ${s.id}: ${s.name} (owner_id: ${s.owner_id})`));

    const ratings = await appPool.query('SELECT id, user_id, store_id, rating FROM ratings ORDER BY id');
    console.log('\nRatings:');
    ratings.rows.forEach(r => console.log(`  ${r.id}: user ${r.user_id} -> store ${r.store_id} = ${r.rating}`));

    console.log('\n✅ Database setup complete!');
  } catch (err) {
    console.error('Error running SQL:', err.message);
    process.exit(1);
  } finally {
    await appPool.end();
  }
}

setup();
