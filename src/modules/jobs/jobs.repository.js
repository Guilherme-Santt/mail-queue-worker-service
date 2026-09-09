import { getDatabase } from "../../config/database.js";

export class JobsRepository {
    async create({ id, queueName, status, payload }) {
        const db = await getDatabase();

        await db.run(
            `
            INSERT INTO jobs_log (id, queue_name, status, payload)
            VALUES (?, ?, ?, ?)
            `,
            [id, queueName, status, JSON.stringify(payload)]
        );

        return this.findById(id);
    }

    async updateStatus(id, { status, result = null, errorMessage = null }) {
        const db = await getDatabase();

        await db.run(
            `
            UPDATE jobs_log
            SET 
                status = ?,
                result = ?,
                error_message = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
            `,
            [
                status,
                result ? JSON.stringify(result) : null,
                errorMessage,
                id
            ]
        );

        return this.findById(id);
    }

    async findById(id) {
        const db = await getDatabase();

        const row = await db.get(
            `
            SELECT * FROM jobs_log WHERE id = ?
            `,
            [id]
        );

        return row;
    }

    async findAll() {
        const db = await getDatabase();

        const rows = await db.all(
            `
            SELECT * FROM jobs_log ORDER BY created_at DESC
            `
        );

        return rows;
    }
}