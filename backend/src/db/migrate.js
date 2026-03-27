require("dotenv").config();
const { Pool } = require("pg");

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const statements = [
  `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'dose_status') THEN
      CREATE TYPE dose_status AS ENUM ('TAKEN', 'SKIPPED', 'MISSED');
    END IF;
  END $$`,

  `CREATE TABLE IF NOT EXISTS users (
    id            SERIAL PRIMARY KEY,
    email         TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name     TEXT,
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    updated_at    TIMESTAMPTZ DEFAULT NOW()
  )`,

  `CREATE TABLE IF NOT EXISTS medications (
    id           SERIAL PRIMARY KEY,
    user_id      INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name         TEXT NOT NULL,
    dosage       TEXT,
    frequency    TEXT,
    instructions TEXT,
    start_date   TIMESTAMPTZ,
    end_date     TIMESTAMPTZ,
    created_at   TIMESTAMPTZ DEFAULT NOW(),
    updated_at   TIMESTAMPTZ DEFAULT NOW()
  )`,

  `CREATE TABLE IF NOT EXISTS dose_logs (
    id            SERIAL PRIMARY KEY,
    user_id       INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    medication_id INT NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
    scheduled_for TIMESTAMPTZ,
    taken_at      TIMESTAMPTZ,
    status        dose_status DEFAULT 'TAKEN',
    note          TEXT,
    created_at    TIMESTAMPTZ DEFAULT NOW()
  )`,

  `CREATE TABLE IF NOT EXISTS appointments (
    id             SERIAL PRIMARY KEY,
    user_id        INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title          TEXT NOT NULL,
    provider_name  TEXT,
    location       TEXT,
    appointment_at TIMESTAMPTZ NOT NULL,
    notes          TEXT,
    created_at     TIMESTAMPTZ DEFAULT NOW(),
    updated_at     TIMESTAMPTZ DEFAULT NOW()
  )`,

  `CREATE TABLE IF NOT EXISTS topics (
    id         TEXT PRIMARY KEY,
    name       TEXT NOT NULL,
    name_kn    TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  )`,

  `CREATE TABLE IF NOT EXISTS articles (
    id         TEXT PRIMARY KEY,
    topic_id   TEXT NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    title      TEXT NOT NULL,
    title_kn   TEXT NOT NULL,
    excerpt    TEXT NOT NULL,
    read_time  INT NOT NULL,
    verified   BOOLEAN DEFAULT TRUE,
    content    TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  )`,

  `CREATE INDEX IF NOT EXISTS articles_topic_id_idx ON articles(topic_id)`,
];

async function main() {
  for (const sql of statements) {
    await db.query(sql);
  }
  console.log("Migration complete.");
}

main()
  .catch((e) => { console.error(e.message); process.exit(1); })
  .finally(() => db.end());
