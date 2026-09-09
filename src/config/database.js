import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import dotenv from 'dotenv';

dotenv.config();

let dbInstance = null;

export async function getDatabase() {
    if (dbInstance) {
        return dbInstance;
    }

    dbInstance = await open({
        filename: process.env.DB_FILE || './database.sqlite',
        driver: sqlite3.Database
    });

    await initTables(dbInstance);

    return dbInstance;
}

async function initTables(db) {
    await db.exec(`
        CREATE TABLE IF NOT EXISTS jobs_log (
        id TEXT PRIMARY KEY,
        queue_name TEXT NOT NULL,
        status TEXT NOT NULL,
        payload TEXT,
        result TEXT,
        error_message TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);
}