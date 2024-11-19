import { poolPromise } from '../lib/db';
import * as sql from 'mssql';
import { DataItem } from '../types/QrCodeTypes';

export const GetDatanonQr = async () => {
    try {
        const pool = await poolPromise;  // Get the pool
        const result = await pool.request().query(`
            SELECT * FROM mgr.QrData WHERE qr_url_attachment IS NULL OR qr_url_attachment = ''
        `);
        return result.recordset;
    } catch (error) {
        console.error("Error fetching data", error);
        throw error;
    }
};

export const GetDataWithQr = async () => {
    try {
        const pool = await poolPromise;  // Get the pool
        const result = await pool.request().query(`
            SELECT * FROM mgr.QrData WHERE qr_url_attachment IS NOT NULL AND qr_url_attachment <> ''
        `);
        return result.recordset;
    } catch (error) {
        console.error("Error fetching data", error);
        throw error;
    }
};

export const GetDataWhere = async (entity_cd: string, reg_id: string) => {
    try {
        const pool = await poolPromise;  // Get the pool connection
        
        // Use parameterized query to prevent SQL injection
        const result = await pool.request()
            .input('entity_cd', entity_cd)
            .input('reg_id', reg_id)
            .query(`
                SELECT * 
                FROM mgr.QrData 
                WHERE entity_cd = @entity_cd 
                AND reg_id = @reg_id
            `);
        
        // Return the fetched data
        return result.recordset;
    } catch (error) {
        console.error("Error fetching data", error);
        throw error;  // Rethrow the error to be handled in the controller
    }
};

export const UpdatePrint = async (dataArray: DataItem[]) => {
    try {
        const pool = await poolPromise;  // Get the pool connection
        
        // Check if the input is an array
        if (!Array.isArray(dataArray)) {
            throw new Error('Input data must be an array');
        }

        const results = await Promise.all(
            dataArray.map(async (item) => {
                const {entity_cd, reg_id} = item;
                const result = await pool.request()
                    .input('entity_cd', entity_cd)
                    .input('reg_id', reg_id)
                    .query(`
                        UPDATE mgr.fa_fasset
                        SET isprint = 'Y'
                        WHERE entity_cd = @entity_cd 
                        AND reg_id = @reg_id;
                        
                        SELECT * 
                        FROM mgr.QrData 
                        WHERE entity_cd = @entity_cd 
                        AND reg_id = @reg_id;
                    `);

                return result.recordset[0];
            })
        );

        return results;
    } catch (error) {
        console.error("Error updating data", error);
        throw error;  // Rethrow the error to be handled in the controller
    }
};