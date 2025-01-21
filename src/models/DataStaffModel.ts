import { poolPromise } from '../lib/db';
import * as sql from 'mssql';

export const GetDataStaff = async () => {
    try {
        const pool = await poolPromise;  // Get the pool
        const result = await pool.request().query(`
            SELECT * FROM mgr.v_fa_fasset_staff_data
        `);
        return result.recordset;
    } catch (error) {
        console.error("Error fetching data for Staff:", error);
        throw error;
    }
};

export const saveDataStaffAsset = async (
    entity_cd: string, 
    reg_id: string,
    staff_id: string, 
    div_cd: string,
    dept_cd: string,
    location_map: string,
    status_review: string,
) => {
    try {
        const pool = await poolPromise; // Mendapatkan koneksi pool ke database
        // Mengambil data yang sudah ada di tabel
        const existingDataResult = await pool.request()
        await pool.request()
            .input('entity_cd', sql.VarChar, entity_cd)
            .input('reg_id', sql.VarChar, reg_id)
            .input('staff_id', sql.VarChar, staff_id || null)
            .input('div_cd', sql.VarChar, div_cd || null)
            .input('dept_cd', sql.VarChar, dept_cd || null)
            .input('location_map', sql.VarChar, div_cd || null)
            .input('status_review', sql.VarChar, dept_cd || null)
            .query(`
                UPDATE mgr.fa_fasset SET staff_id = @staff_id, div_cd = @div_cd, dept_cd = @dept_cd, location_map = @location_map, status_review
                WHERE entity_cd = @entity_cd AND reg_id = @reg_id
            `);
    } catch (error) {
        console.error("Error fetching data for Staff:", error);
        throw error;
    }
};