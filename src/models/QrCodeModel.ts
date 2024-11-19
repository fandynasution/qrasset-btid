import { poolPromise } from '../lib/db';
import * as sql from 'mssql';

export const GetDataGenerate = async () => {
    try {
        const pool = await poolPromise;  // Get the pool
        const result = await pool.request().query(`
            SELECT * FROM mgr.v_fa_fasset_qrdata WHERE qr_url_attachment IS NULL OR qr_url_attachment = ''
        `);
        return result.recordset;
    } catch (error) {
        console.error("Error fetching data for QR code generation:", error);
        throw error;
    }
};

export const QrCodeDataInsert = async (data: any) => {
    const pool = await poolPromise;  // Get the pool
    const transaction = pool.transaction();  // Start a transaction
    try {
      await transaction.begin();
  
      const request = transaction.request();
      
      // Loop over data and perform insertion in the transaction
      for (const item of data) {
        await request.query(`
            UPDATE mgr.fa_fasset
            SET qr_url_attachment = '${item.qr_url_attachment}'
            WHERE entity_cd = '${item.entity_cd}' AND reg_id = '${item.reg_id}';
        `);
      }
  
      // Commit the transaction if all queries succeed
      await transaction.commit();
    } catch (error) {
      // If an error occurs, rollback the transaction
      await transaction.rollback();
      console.error('Error inserting QR code data:', error);
      throw error;  // Re-throw error to be handled in the controller
    }
  };