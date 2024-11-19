import { Request, Response } from "express";
import { GetDataGenerate, QrCodeDataInsert } from "../models/QrCodeModel";
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import { DataItem } from '../types/QrCodeTypes';

const logDirPath = path.join(__dirname, `../storage/log-${new Date().toISOString().split('T')[0]}`); // Folder path for logs
const logFilesuccessPath = path.join(logDirPath, `SUCCESS.txt`); // Log file per day
const logFileErrorPath = path.join(logDirPath, `Error.txt`); // Log file per day

// Ensure the log directory exists
if (!fs.existsSync(logDirPath)) {
    fs.mkdirSync(logDirPath, { recursive: true }); // Create the log directory if it doesn't exist
}

export const generateAndSaveQrCode = async (req: Request, res: Response) => {
    const storagePath = path.join(__dirname, '..', 'storage', 'qr'); 

    if (!fs.existsSync(storagePath)) {
        fs.mkdirSync(storagePath, { recursive: true }); // Create the directory if it doesn't exist
    }

    try {
        const dataQr = await GetDataGenerate();

        // Check if no data is returned
        if (dataQr.length === 0) {
            const errorMessage = "No data found for QR code generation.";
            
            // Log error
            const logMessage = `${new Date().toISOString()} - ERROR: ${errorMessage}\n`;
            fs.appendFileSync(logFileErrorPath, logMessage);

            
            return res.status(404).json({
                success: false,
                message: errorMessage
            });
        }

        const filteredDataWithQRCode = await Promise.all(dataQr.map(async (item: any) => {
            const qrContent = {
                entity_cd: item.entity_cd,
                reg_id: item.reg_id
            };
            
            return QRCode.toBuffer(JSON.stringify(qrContent), { type: 'png', scale: 12 }).then((qrCodeBuffer) => {
                // Step 3: Generate a file name using reg_id and replace "/" with "_"
                let fileName = `${item.reg_id.replace(/\//g, '_')}.png`;
                let filePath = path.join(storagePath, fileName);
            
                // Save the QR code buffer to the unique file path
                fs.writeFileSync(filePath, qrCodeBuffer);
                
                // Prepare the data for database insertion
                const urlPath = `${process.env.API_SWAGGER_URL}:${process.env.API_SWAGGER_PORT}/api/qrasset/qr/${fileName}`;
                
                return {
                    entity_cd: item.entity_cd,
                    reg_id: item.reg_id,
                    qr_url_attachment: urlPath, // File path to be stored in DB
                };
            });
        }));

        // Insert or update the QR code data into the database
        const data = await QrCodeDataInsert(filteredDataWithQRCode);
        const logMessage = `${new Date().toISOString()} - INFO: Success Generate QR Code\n`;
        fs.appendFileSync(logFilesuccessPath, logMessage);
        // Send the response with success message and inserted data
        res.status(200).json({
            success: true,
            message: "Success Generate QR Code" // Optional: To send the DB insert result if needed
        });
    } catch (error) {
        console.error("Error in generating or saving QR codes:", error);
        const logMessage = `${new Date().toISOString()} - ERROR: ${error}\n`;
        fs.appendFileSync(logFileErrorPath, logMessage);
        res.status(500).json({
            success: false,
            message: "Failed to generate or save QR codes",
            error: error instanceof Error ? error.message : "Unknown error occurred",
        });
    }
};
