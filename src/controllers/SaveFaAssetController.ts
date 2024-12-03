import { Request, Response } from "express";
import fs from 'fs';
import path from 'path';
import multer from "multer";
import * as ftp from 'basic-ftp';
import { createLogger, format, transports } from "winston";
import { checkAndUpdateAsset, syncToFassetTrx } from '../models/SaveFaAssetModel';
import { getFtpDetails } from '../models/QrCodeModel';

// Ensure the target directory exists
const uploadDir = path.join(__dirname, '../../storage/assetpicture');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true }); // Create the directory if it doesn't exist
}

// Set up multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir); // Specify the target directory for uploaded files
    },
    filename: (req, file, cb) => {
        const fileExtension = path.extname(file.originalname); // Get file extension
        const fileName = `${Date.now()}-${file.originalname}`; // Create a unique file name
        cb(null, fileName); // Set the file name to save
    },
});

// Set up multer to handle form-data (with a max of 10 files, if needed)
const upload = multer({ storage: storage });

// Folder log
const logDir = path.join(__dirname, '../../storage/log');

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

export const UpdateAsset = async (req: Request, res: Response) => {
    // Buat logger
    const logger = createLogger({
        level: 'info',
        format: format.combine(
            format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            format.printf(({ timestamp, level, message }) => `${timestamp} [${level.toUpperCase()}]: ${message}`)
        ),
        transports: [
            new transports.File({ filename: path.join(logDir, getLogFileName()) }) // Simpan ke file log harian
        ]
    });

    const dataWhereD = req.body;

    const dataArray = Array.isArray(dataWhereD) ? dataWhereD : [dataWhereD];

    // Validate that each entry has the required fields
    const hasRequiredFields = (detail: { entity_cd: string; reg_id: string }) =>
        detail.entity_cd && detail.reg_id;

    if (!dataArray.every(hasRequiredFields)) {
        const errorMessage = "entity_cd and reg_id are required";
        logger.error(errorMessage);

        return res.status(400).json({
            success: false,
            message: errorMessage,
        });
    }
    try {
        for (const dataItem of dataArray) {
            const { entity_cd, reg_id, source_file_attachment, status_review, notes, location_map, audit_status } = dataItem;

            logger.info(`Processing data for entity_cd: ${entity_cd} and reg_id: ${reg_id}`);

            // Upload ke FTP jika source_file_attachment ada
            let ftpUrl: string | null = null;
            if (source_file_attachment) {
                try {
                    // Decode Base64 URI dan simpan sebagai file gambar
                    const base64Data = source_file_attachment.replace(/^data:image\/\w+;base64,/, '');
                    const fileExtension = source_file_attachment.match(/\/(.*?)\;/)?.[1] || 'png'; // Ekstensi gambar
                    const sanitizedRegId = reg_id.replace(/[\\/]/g, '_');
                    const tempFileName = `Asset_${entity_cd}_${sanitizedRegId}.${fileExtension}`;
                    const tempDir = path.join(__dirname, '../../storage/temppicture');
                    if (!fs.existsSync(tempDir)) {
                        fs.mkdirSync(tempDir, { recursive: true });
                        logger.info(`Directory created: ${tempDir}`);
                    }
                    const tempFilePath = path.join(tempDir, tempFileName);

                    fs.writeFileSync(tempFilePath, base64Data, { encoding: 'base64' });
                    logger.info(`Temporary file created at: ${tempFilePath}`);

                    // Upload file ke server FTP
                    const ftpClient = new ftp.Client();
                    ftpClient.ftp.verbose = true; // Untuk debugging

                    const ftpDetails = await getFtpDetails();

                    await ftpClient.access({
                        host: ftpDetails.FTPServer, // Ganti dengan host FTP Anda
                        port: ftpDetails.FTPPort,
                        user: ftpDetails.FTPUser,        // Username FTP
                        password: ftpDetails.FTPPassword,// Password FTP
                        secure: false,           // Atur ke true jika menggunakan FTPS
                    });

                    // Pastikan folder di FTP ada
                    const remoteFolderPath = `/ifca-att/FAAssetUpload/AssetPicture/`;
                    await ftpClient.ensureDir(remoteFolderPath); // Membuat folder jika belum ada
                    logger.info(`Ensured folder exists: ${remoteFolderPath}`);

                    const remoteFilePath = `${remoteFolderPath}${tempFileName}`;
                    await ftpClient.uploadFrom(tempFilePath, remoteFilePath);
                    logger.info(`File uploaded to FTP: ${remoteFilePath}`);

                    // Simpan URL FTP
                    ftpUrl = `${ftpDetails.URLPDF}${remoteFolderPath}${tempFileName}`;

                    // Hapus file sementara setelah diunggah
                    fs.unlinkSync(tempFilePath);
                    logger.info(`Temporary file deleted: ${tempFilePath}`);

                    ftpClient.close();
                } catch (ftpError) {
                    logger.error(`FTP upload failed for entity_cd: ${entity_cd}, reg_id: ${reg_id}. Error: ${ftpError}`);
                }
            }

            // Data untuk diperbarui
            const fassetUpdates: { [key: string]: string | null } = {
                source_file_attachment: ftpUrl || null,
                status_review: status_review || null,
                location_map: location_map || null,
            };

            // Panggil fungsi untuk menyimpan data
            await checkAndUpdateAsset(entity_cd, reg_id, fassetUpdates);

            // Data untuk tabel `mgr.fa_fasset_trx`
            const fassetTrxUpdates: { [key: string]: string | null } = {
                new_status_review: status_review || null,
                note: notes || null,
                new_location_map: location_map || null,
                audit_status: audit_status || null,
            };
            await syncToFassetTrx(entity_cd, reg_id, fassetTrxUpdates);

            logger.info(`Successfully updated data for entity_cd: ${entity_cd}, reg_id: ${reg_id}`);
        }

        return res.status(200).json({
            success: true,
            message: 'All data processed and inserted/updated successfully',
        });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";

        logger.error(`Failed to update assets: ${errorMessage}`);

        res.status(500).json({
            success: false,
            message: "Failed to update assets",
            error: errorMessage,
            stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined,
        });
    }
};