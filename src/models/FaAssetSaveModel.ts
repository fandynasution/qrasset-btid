import { poolPromise } from '../lib/db';
import * as sql from 'mssql';

// Fungsi untuk memperbarui data asset di database
export const checkAndUpdate = async (
    entity_cd: string,
    reg_id: string,
    files: string[]
) => {
    try {
        const pool = await poolPromise; // Mendapatkan koneksi pool ke database

        // Mengambil data yang sudah ada di tabel
        const existingDataResult = await pool.request()
            .input('entity_cd', sql.VarChar, entity_cd)
            .input('reg_id', sql.VarChar, reg_id)
            .query(`
                SELECT url_file_attachment, url_file_attachment2, url_file_attachment3, location_map, status_review
                FROM mgr.fa_fasset
                WHERE entity_cd = @entity_cd AND reg_id = @reg_id
            `);
        
        const existingData = existingDataResult.recordset[0];

        if (existingData) {
            let updates: { [key: string]: string | null } = {};

            // Kondisi untuk 3 file
            if (files.length === 3) {
                updates['url_file_attachment'] = files[0];
                updates['url_file_attachment2'] = files[1];
                updates['url_file_attachment3'] = files[2];
            }
            // Kondisi untuk 2 file
            else if (files.length === 2) {
                updates['url_file_attachment'] = files[0];
                updates['url_file_attachment2'] = files[1];
                // Jika file 2 sudah ada di url_file_attachment3, jangan diupdate
                if (!existingData.url_file_attachment3) {
                    updates['url_file_attachment3'] = null;
                }
            }
            // Kondisi untuk 1 file
            else if (files.length === 1) {
                updates['url_file_attachment'] = files[0];
                // Jika url_file_attachment2 atau url_file_attachment3 sudah ada data, biarkan tetap
                if (!existingData.url_file_attachment2) {
                    updates['url_file_attachment2'] = null;
                }
                if (!existingData.url_file_attachment3) {
                    updates['url_file_attachment3'] = null;
                }
            }

            // Jika ada perubahan, lakukan pembaruan
            if (Object.keys(updates).length > 0) {
                await update(entity_cd, reg_id, updates);
            }
        }
    } catch (error) {
        console.error("Error syncing data to fa_fasset:", error);
        throw error;
    }
};

// Fungsi untuk melakukan update pada tabel mgr.fa_fasset
const update = async (entity_cd: string, reg_id: string, updates: { [key: string]: string | null }) => {
    try {
        const pool = await poolPromise; // Mendapatkan koneksi pool ke database
        let updateFields: string[] = [];
        
        // Menyusun klausa UPDATE
        for (const [key, value] of Object.entries(updates)) {
            if (value !== null) {
                updateFields.push(`${key} = @${key}`);
            }
        }

        const setClause = updateFields.join(', ');
        const request = pool.request();
        request.input('entity_cd', sql.VarChar, entity_cd);
        request.input('reg_id', sql.VarChar, reg_id);

        // Menambahkan parameter untuk setiap field yang diperbarui
        for (const [key, value] of Object.entries(updates)) {
            if (value === null) {
                // Jika null, set null untuk kolom string atau kolom lain
                request.input(key, sql.VarChar, null); // Set null untuk tipe string
            } else {
                // Untuk tipe lainnya (seperti string), set sesuai dengan tipe data
                request.input(key, sql.VarChar, value);
            }
        }

        await request.query(`
            UPDATE mgr.fa_fasset
            SET ${setClause}
            WHERE entity_cd = @entity_cd AND reg_id = @reg_id
        `);

        console.log(`Data updated in fa_fasset for entity_cd: ${entity_cd}, reg_id: ${reg_id}`);
    } catch (error) {
        console.error("Error updating asset:", error);
        throw error;
    }
};