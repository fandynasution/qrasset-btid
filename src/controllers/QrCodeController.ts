import { Request, Response } from "express";
import { GetDataGenerate, QrCodeDataInsert } from "../models/QrCodeModel";
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import { DataItem } from '../types/QrCodeTypes';

export const generateAndSaveQrCode = async (req: Request, res: Response) => {
    const storagePath = path.join(__dirname, '..', 'storage', 'qr'); 

    if (!fs.existsSync(storagePath)) {
        fs.mkdirSync(storagePath, { recursive: true }); // Create the directory if it doesn't exist
    }

    try {
        const dataQr = await GetDataGenerate();

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

        // Send the response with success message and inserted data
        res.json({
            success: true,
            data // Optional: To send the DB insert result if needed
        });
    } catch (error) {
        console.error("Error in generating or saving QR codes:", error);
        res.status(500).json({
            success: false,
            message: "Failed to generate or save QR codes",
            error: error instanceof Error ? error.message : "Unknown error occurred",
        });
    }
};
