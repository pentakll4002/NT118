const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString =
  process.env.PG_CONNECTION_STRING ||
  process.env.DATABASE_URL ||
  'postgres://postgres:postgres@localhost:5432/nt118';

const client = new Client({ connectionString });

function slugify(input) {
  return (input || '')
    .toString()
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function toRow({ code, name, parentCode, level }) {
  const codeName = slugify(name);
  return [
    code,
    name,
    '', // name_en
    name, // full_name
    '', // full_name_en
    codeName,
    parentCode || null,
    level,
  ];
}

async function insertBatch(rows) {
  if (rows.length === 0) return;
  const cols = 8;
  const values = [];
  const placeholders = rows.map((r, i) => {
    const base = i * cols;
    values.push(...r);
    return `($${base + 1},$${base + 2},$${base + 3},$${base + 4},$${base + 5},$${base + 6},$${base + 7},$${base + 8})`;
  });

  await client.query(
    `
    INSERT INTO addresses (code, name, name_en, full_name, full_name_en, code_name, parent_code, level)
    VALUES ${placeholders.join(',')}
    ON CONFLICT (code) DO UPDATE SET
      name = EXCLUDED.name,
      name_en = EXCLUDED.name_en,
      full_name = EXCLUDED.full_name,
      full_name_en = EXCLUDED.full_name_en,
      code_name = EXCLUDED.code_name,
      parent_code = EXCLUDED.parent_code,
      level = EXCLUDED.level;
    `,
    values
  );
}

async function run() {
  try {
    await client.connect();
    console.log('Connected to DB');

    // Read json
    const jsonPath = path.resolve(__dirname, 'data.json');
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

    await client.query('BEGIN;');

    // Drop & recreate to match "data.json is the official source"
    await client.query('DROP TABLE IF EXISTS addresses;');
    await client.query(`
      CREATE TABLE addresses (
        code VARCHAR(20) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        name_en VARCHAR(255),
        full_name VARCHAR(255) NOT NULL,
        full_name_en VARCHAR(255),
        code_name VARCHAR(255) NOT NULL,
        parent_code VARCHAR(20),
        level INTEGER NOT NULL
      );
    `);

    let count = 0;
    const batch = [];
    const BATCH_SIZE = 500;

    for (const level1 of data) {
      // Province
      batch.push(toRow({ code: level1.level1_id, name: level1.name, parentCode: null, level: 1 }));
      count += 1;

      // Districts
      const level2s = Array.isArray(level1.level2s) ? level1.level2s : [];
      for (const level2 of level2s) {
        batch.push(toRow({ code: level2.level2_id, name: level2.name, parentCode: level1.level1_id, level: 2 }));
        count += 1;

        // Wards
        const level3s = Array.isArray(level2.level3s) ? level2.level3s : [];
        for (const level3 of level3s) {
          batch.push(toRow({ code: level3.level3_id, name: level3.name, parentCode: level2.level2_id, level: 3 }));
          count += 1;
          if (batch.length >= BATCH_SIZE) {
            await insertBatch(batch.splice(0, batch.length));
          }
        }
        if (batch.length >= BATCH_SIZE) {
          await insertBatch(batch.splice(0, batch.length));
        }
      }

      if (batch.length >= BATCH_SIZE) {
        await insertBatch(batch.splice(0, batch.length));
      }
    }

    if (batch.length) await insertBatch(batch);
    await client.query('COMMIT;');

    console.log(`Recreated addresses table and upserted ${count} rows from ${jsonPath}`);
  } catch (err) {
    try {
      await client.query('ROLLBACK;');
    } catch {}
    console.error('Error inserting addresses:', err);
  } finally {
    await client.end();
  }
}

run();
