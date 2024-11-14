import { checkDbConnection } from "../lib/db";
import sql, { pool } from 'mssql';
import { QrCodeInsertData } from '../types/QrCodeTypes';

export async function GetDataGenerate(): Promise<any> {
    try {
        const pool = await checkDbConnection();

        const result = await pool.request()
            .query("SELECT * FROM mgr.fa_fasset WHERE qr_url_attachment IS NULL OR qr_url_attachment = ''");

        return result.recordset; // Return the result set as needed
    } catch (error) {
        throw error;
    }
}

export const QrCodeDataInsert = async (data: QrCodeInsertData[]) => {
    if (data.length === 0) {
        return { message: "No records to insert." };
    }

    let pool;
    let transaction;

    try {
        pool = await checkDbConnection();
        transaction = pool.transaction();
        await transaction.begin();


        for (const entry of data) {
            await transaction.request()
            .input('entity_cd', sql.VarChar, entry.entity_cd)
            .input('reg_id', sql.VarChar, entry.reg_id)
            .input('qr_url_attachment', sql.VarChar, entry.qr_url_attachment)
            .query(`
                UPDATE mgr.fa_fasset 
                SET qr_url_attachment = @qr_url_attachment 
                WHERE entity_cd = @entity_cd 
                AND reg_id = @reg_id
            `);
        }

        await transaction.commit(); // Commit the transaction

        return {
            success: true,
            message: "All records inserted successfully."
        };
    }catch (error) {
        if (transaction) await transaction.rollback(); // Rollback on error
        console.error("Error inserting QR code data:", error);
        return {
            success: false,
            message: "Failed to insert QR code data",
            error: error instanceof Error ? error.message : "Unknown error occurred",
        };
    } finally {
        if (pool) await pool.close(); // Close the pool
    }
};