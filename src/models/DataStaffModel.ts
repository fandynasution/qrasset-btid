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