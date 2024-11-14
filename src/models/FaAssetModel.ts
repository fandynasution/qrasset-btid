import { checkDbConnection } from "../lib/db";
import sql, { pool } from 'mssql';

export async function GetDatanonQr(): Promise<any> {
    try {
        const pool = await checkDbConnection();

        const result = await pool.request()
            .query("SELECT * FROM mgr.QrData WHERE qr_url_attachment IS NULL OR qr_url_attachment = ''");

        return result.recordset; // Return the result set as needed
    } catch (error) {
        throw error;
    }
}

export async function GetDataWithQr(): Promise<any> {
    try {
        const pool = await checkDbConnection();

        const result = await pool.request()
            .query("SELECT * FROM mgr.QrData WHERE qr_url_attachment IS NOT NULL AND qr_url_attachment <> ''");

        return result.recordset; // Return the result set as needed
    } catch (error) {
        throw error;
    }
}

export async function GetDataWhere(entity_cd: string, reg_id: string): Promise<any> {
    try {
        const pool = await checkDbConnection();

        const result = await pool.request()
            .input('entity_cd', entity_cd)
            .input('reg_id', reg_id)
            .query("SELECT * FROM mgr.QrData WHERE entity_cd = @entity_cd AND reg_id = @reg_id");

        return result.recordset; // Return the result set as needed
    } catch (error) {
        throw error;
    }
}