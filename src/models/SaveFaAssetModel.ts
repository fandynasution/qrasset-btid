import { poolPromise } from '../lib/db';
import * as sql from 'mssql';
import fs from 'fs';
import path from 'path';
import logger from "../logger";
import { createLogger, format, transports } from "winston";

// Folder log
const logDir = path.join(__dirname, '../storage/log');

// Pastikan folder log ada
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

// Format tanggal untuk nama file
const getLogFileName = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `log-${year}-${month}-${day}.txt`;
};

export const checkAndUpdateAsset = async (
    entity_cd: string,
    reg_id: string,
    updates: { [key: string]: string | number | null }
) => {
    const storagePath = path.join(__dirname, '..', 'storage', 'qr'); 
        
    if (!fs.existsSync(storagePath)) {
        fs.mkdirSync(storagePath, { recursive: true }); // Create the directory if it doesn't exist
    }

    
    // Buat logger
    const logger = createLogger({
        level: 'info',
        format: format.combine(
            format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            format.printf(({ timestamp, level, message }) => `${timestamp} [${level.toUpperCase()}]: ${message}`)
        ),
        transports: [
            new transports.File({ filename: path.join(logDir, getLogFileName()) }), // Simpan ke file log harian
        ]
    });
    
    try {
        const pool = await poolPromise; // Get the pool

        const existingDataResult = await pool.request()
            .input('entity_cd', sql.VarChar, entity_cd)
            .input('reg_id', sql.VarChar, reg_id)
            .query(`
                SELECT url_file_attachment, location_map, status_review
                FROM mgr.fa_fasset
                WHERE entity_cd = @entity_cd AND reg_id = @reg_id
            `);
        
        const existingData = existingDataResult.recordset[0];

        if (existingData) {
            let isDifferent = false;
            const updateFields = [];
            for (const [key, value] of Object.entries(updates)) {
                if (existingData[key] !== value) {
                    isDifferent = true;
                    updateFields.push(`${key} = @${key}`);
                }
            }
            if (isDifferent) {
                // Ada perbedaan, lakukan UPDATE
                const setClause = updateFields.join(', ');
                const request = pool.request();
                request.input('entity_cd', sql.VarChar, entity_cd);
                request.input('reg_id', sql.VarChar, reg_id);
                for (const [key, value] of Object.entries(updates)) {
                    const type = typeof value === 'number' ? sql.Int : sql.VarChar;
                    request.input(key, type, value);
                }

                await request.query(`
                    UPDATE mgr.fa_fasset
                    SET ${setClause}
                    WHERE entity_cd = @entity_cd AND reg_id = @reg_id
                `);
                logger.info(`Data updated in fa_fasset for entity_cd: ${entity_cd}, reg_id: ${reg_id}`);
            } else {
                logger.info(`No changes for entity_cd: ${entity_cd}, reg_id: ${reg_id}. Data is identical.`);
            }
        }
    } catch (error) {
        logger.error("Error syncing data to fa_fasset:", error);
        throw error;
    }
};

export const syncToFassetTrx = async (
    entity_cd: string,
    reg_id: string,
    updates: { [key: string]: any }
) => {
    try {
        const pool = await poolPromise;

        // Query untuk cek apakah data sudah ada
        const existingDataResult = await pool.request()
            .input('entity_cd', sql.VarChar, entity_cd)
            .input('reg_id', sql.VarChar, reg_id)
            .query(`
                SELECT TOP 1 new_location_map, new_status_review, note, audit_status
                FROM mgr.fa_fasset_trx
                WHERE entity_cd = @entity_cd AND reg_id = @reg_id
                ORDER BY trx_date DESC
            `);

        const existingData = existingDataResult.recordset[0];

        if (existingDataResult.recordset.length === 0) {
            // Jika data belum ada, lakukan insert langsung
            await pool.request()
                .input('entity_cd', sql.VarChar, entity_cd)
                .input('reg_id', sql.VarChar, reg_id)
                .input('new_location_map', sql.VarChar, updates.new_location_map || null)
                .input('new_status_review', sql.VarChar, updates.new_status_review || null)
                .input('note', sql.VarChar, updates.note || null)
                .input('audit_status', sql.VarChar, updates.audit_status || null)
                .query(`
                    INSERT INTO mgr.fa_fasset_trx 
                    (entity_cd, reg_id, trx_date, old_location_map, new_location_map, old_status_review, new_status_review, note, audit_status, audit_user, audit_date)
                    VALUES 
                    (@entity_cd, @reg_id, GETDATE(), null, @new_location_map, null, @new_status_review, @note, @audit_status, 'WEBAPI', GETDATE())
                `);
        } else {
            // Optimasi: Gunakan nilai existingData jika updates bernilai null
            const newLocationMap = updates.new_location_map ?? existingData.new_location_map;
            const newStatusReview = updates.new_status_review ?? existingData.new_status_review;
            const note = updates.note ?? existingData.note ?? 'No Note';
            const auditStatus = updates.audit_status ?? existingData.audit_status ?? 'N';

            // Cek apakah data berbeda
            if (
                existingData.new_location_map !== newLocationMap ||
                existingData.new_status_review !== newStatusReview
            ) {
                await pool.request()
                    .input('entity_cd', sql.VarChar, entity_cd)
                    .input('reg_id', sql.VarChar, reg_id)
                    .input('new_location_map', sql.VarChar, newLocationMap)
                    .input('old_location_map', sql.VarChar, existingData.new_location_map)
                    .input('new_status_review', sql.VarChar, newStatusReview)
                    .input('old_status_review', sql.VarChar, existingData.new_status_review)
                    .input('note', sql.VarChar, note)
                    .input('audit_status', sql.VarChar, auditStatus)
                    .query(`
                        INSERT INTO mgr.fa_fasset_trx 
                        (entity_cd, reg_id, trx_date, old_location_map, new_location_map, old_status_review, new_status_review, note, audit_status, audit_user, audit_date)
                        VALUES 
                        (@entity_cd, @reg_id, GETDATE(), @old_location_map, @new_location_map, @old_status_review, @new_status_review, @note, @audit_status, 'WEBAPI', GETDATE())
                    `);
            }

            // Update jika ada perbedaan untuk note atau audit_status
            if (existingData.note !== note) {
                await pool.request()
                    .input('entity_cd', sql.VarChar, entity_cd)
                    .input('reg_id', sql.VarChar, reg_id)
                    .input('note', sql.VarChar, note)
                    .query(`
                        UPDATE mgr.fa_fasset_trx
                        SET note = @note
                        WHERE entity_cd = @entity_cd 
                        AND reg_id = @reg_id
                        AND trx_date = (
                            SELECT MAX(trx_date)
                            FROM mgr.fa_fasset_trx
                            WHERE entity_cd = @entity_cd 
                                AND reg_id = @reg_id
                        );
                    `);
            }

            if (existingData.audit_status !== auditStatus) {
                await pool.request()
                    .input('entity_cd', sql.VarChar, entity_cd)
                    .input('reg_id', sql.VarChar, reg_id)
                    .input('audit_status', sql.VarChar, auditStatus)
                    .query(`
                        UPDATE mgr.fa_fasset_trx
                        SET audit_status = @audit_status
                        WHERE entity_cd = @entity_cd 
                        AND reg_id = @reg_id
                        AND trx_date = (
                            SELECT MAX(trx_date)
                            FROM mgr.fa_fasset_trx
                            WHERE entity_cd = @entity_cd 
                                AND reg_id = @reg_id
                        );
                    `);
            }
        }
    } catch (error) {
        logger.error('Error syncing data to fa_fasset_trx:', error);
        throw error;
    }
};
