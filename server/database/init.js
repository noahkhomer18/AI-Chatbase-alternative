const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = process.env.DATABASE_PATH || './database/chatbase.db';

// Ensure database directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath);

const initDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Users table
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          name TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Documents table
      db.run(`
        CREATE TABLE IF NOT EXISTS documents (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          filename TEXT NOT NULL,
          original_name TEXT NOT NULL,
          file_type TEXT NOT NULL,
          file_size INTEGER NOT NULL,
          content TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `);

      // Conversations table
      db.run(`
        CREATE TABLE IF NOT EXISTS conversations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          title TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `);

      // Messages table
      db.run(`
        CREATE TABLE IF NOT EXISTS messages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          conversation_id INTEGER NOT NULL,
          role TEXT NOT NULL,
          content TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (conversation_id) REFERENCES conversations (id)
        )
      `);

      // Document-conversation relationships
      db.run(`
        CREATE TABLE IF NOT EXISTS conversation_documents (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          conversation_id INTEGER NOT NULL,
          document_id INTEGER NOT NULL,
          FOREIGN KEY (conversation_id) REFERENCES conversations (id),
          FOREIGN KEY (document_id) REFERENCES documents (id)
        )
      `);

      // Training datasets table
      db.run(`
        CREATE TABLE IF NOT EXISTS training_datasets (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          name TEXT NOT NULL,
          description TEXT,
          status TEXT DEFAULT 'processing',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `);

      // Training data table
      db.run(`
        CREATE TABLE IF NOT EXISTS training_data (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          dataset_id INTEGER NOT NULL,
          filename TEXT NOT NULL,
          file_type TEXT NOT NULL,
          content TEXT NOT NULL,
          file_size INTEGER NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (dataset_id) REFERENCES training_datasets (id)
        )
      `);

      // Trained models table
      db.run(`
        CREATE TABLE IF NOT EXISTS trained_models (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          dataset_id INTEGER NOT NULL,
          name TEXT NOT NULL,
          status TEXT DEFAULT 'training',
          parameters TEXT,
          model_path TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          completed_at DATETIME,
          FOREIGN KEY (user_id) REFERENCES users (id),
          FOREIGN KEY (dataset_id) REFERENCES training_datasets (id)
        )
      `, (err) => {
        if (err) {
          reject(err);
        } else {
          console.log('Database initialized successfully');
          resolve();
        }
      });
    });
  });
};

module.exports = { initDatabase, db };
