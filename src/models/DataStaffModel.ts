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
        console.error("Error fetching data", error);
        throw error;
    }
};

export const GetDataStaffId = async (staff_id: string) => {
    try {
        const pool = await poolPromise;  // Get the pool
        console.log(staff_id);
        const result = await pool.request()
            .input('staff_id', sql.VarChar, staff_id)
            .query(`
                SELECT * FROM mgr.v_fa_fasset_staff_data
                WHERE staff_id = @staff_id
            `);
        return result.recordset;
    } catch (error) {
        console.error("Error fetching data", error);
        throw error;
    }
};

export const saveDataStaffAsset = async (
    entity_cd: string, 
    reg_id: string,
    staff_id: string, 
    div_cd: string,
    dept_cd: string,
) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('entity_cd', sql.VarChar, entity_cd)
            .input('reg_id', sql.VarChar, reg_id)
            .input('staff_id', sql.VarChar, staff_id || null)
            .input('div_cd', sql.VarChar, div_cd || null)
            .input('dept_cd', sql.VarChar, dept_cd || null)
            .query(`
                UPDATE mgr.fa_fasset SET staff_id = @staff_id, div_cd = @div_cd, dept_cd = @dept_cd
                WHERE entity_cd = @entity_cd AND reg_id = @reg_id
            `);
        return result;
    } catch (error) {
        console.error("Error updating data for Staff:", error);
        throw error;
    }
};