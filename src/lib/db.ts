import Database from 'better-sqlite3'
import path from 'path'

const DB_PATH = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'automation.db')

let db: Database.Database | null = null

export function getDb(): Database.Database {
  if (!db) {
    // Ensure data directory exists
    const fs = require('fs')
    const dir = path.dirname(DB_PATH)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    db = new Database(DB_PATH)
    db.pragma('journal_mode = WAL')
    db.pragma('foreign_keys = ON')
    initSchema(db)
  }
  return db
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS requests (
      id TEXT PRIMARY KEY,
      sourceType TEXT NOT NULL,
      sourceRef TEXT NOT NULL DEFAULT '',
      title TEXT NOT NULL,
      rawContent TEXT NOT NULL,
      extractedData TEXT NOT NULL DEFAULT '{}',
      category TEXT,
      priority TEXT,
      confidence REAL,
      routeDestination TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS workflows (
      id TEXT PRIMARY KEY,
      requestId TEXT NOT NULL,
      workflowType TEXT NOT NULL,
      assignedQueue TEXT NOT NULL,
      actionTaken TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'pending',
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (requestId) REFERENCES requests(id)
    );

    CREATE TABLE IF NOT EXISTS automation_logs (
      id TEXT PRIMARY KEY,
      requestId TEXT NOT NULL,
      eventType TEXT NOT NULL,
      message TEXT NOT NULL,
      metadata TEXT NOT NULL DEFAULT '{}',
      createdAt TEXT NOT NULL,
      FOREIGN KEY (requestId) REFERENCES requests(id)
    );

    CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);
    CREATE INDEX IF NOT EXISTS idx_requests_category ON requests(category);
    CREATE INDEX IF NOT EXISTS idx_requests_priority ON requests(priority);
    CREATE INDEX IF NOT EXISTS idx_requests_createdAt ON requests(createdAt);
    CREATE INDEX IF NOT EXISTS idx_workflows_requestId ON workflows(requestId);
    CREATE INDEX IF NOT EXISTS idx_workflows_status ON workflows(status);
    CREATE INDEX IF NOT EXISTS idx_logs_requestId ON automation_logs(requestId);
    CREATE INDEX IF NOT EXISTS idx_logs_eventType ON automation_logs(eventType);
    CREATE INDEX IF NOT EXISTS idx_logs_createdAt ON automation_logs(createdAt);
  `)
}
