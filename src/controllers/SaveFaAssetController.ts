import { Request, Response } from "express";
import fs from 'fs';
import path from 'path';
import multer from "multer";
import * as ftp from 'basic-ftp';
import { createLogger, format, transports } from "winston";
import { checkAndUpdateAsset, syncToFassetTrx } from '../models/SaveFaAssetModel';
import { checkAndUpdate } from '../models/FaAssetSaveModel';
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
    // Create logger
    const logger = createLogger({
        level: 'info',
        format: format.combine(
            format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            format.printf(({ timestamp, level, message }) => `${timestamp} [${level.toUpperCase()}]: ${message}`)
        ),
        transports: [
            new transports.File({ filename: path.join(logDir, getLogFileName()) }) // Save to daily log file
        ]
    });

    const dataWhereD = req.body;
    const dataArray = Array.isArray(dataWhereD) ? dataWhereD : [dataWhereD];

    // Validate that each entry has the required fields
    const validateFields = (details: { entity_cd: string; reg_id: string; location_map: string; files: string[]; status_review: string }) => {
        const missingFields = [];
        if (!details.entity_cd) missingFields.push("entity_cd cannot be empty");
        if (!details.reg_id) missingFields.push("reg_id cannot be empty");
        if (!details.location_map) missingFields.push("location_map cannot be empty");
        if (!details.files || details.files.length < 1) {
            missingFields.push("At least 1 file");
        } else if (details.files.length > 3) {
            missingFields.push("No more than 3 files allowed");
        }
        if (!details.status_review) missingFields.push("status_review cannot be empty");
        return missingFields;
    };

    // Check all entries in dataArray
    const invalidEntries = dataArray.map((detail, index) => {
        const missingFields = validateFields(detail);
        return { index, missingFields };
    }).filter(entry => entry.missingFields.length > 0);

    if (invalidEntries.length > 0) {
        const ErrorField = invalidEntries.flatMap(entry => entry.missingFields);

        res.status(400).json({
            success: false,
            message: 'Validation failed',
            ErrorField
        });
        return;
    }

    try {
        for (const dataItem of dataArray) {
            const { entity_cd, reg_id, files, status_review, notes, location_map, audit_status } = dataItem;

            logger.info(`Processing data for entity_cd: ${entity_cd} and reg_id: ${reg_id}`);

            // Ensure reg_id is sanitized for file names
            const sanitizedRegId = reg_id.replace(/\//g, "_");

            // Process each file
            const filePaths: string[] = [];  // To store file paths for update
            for (const [index, fileObj] of files.entries()) {
                // Ensure the fileObj contains the expected key `file_data`
                if (!fileObj || typeof fileObj.file_data !== 'string') {
                    logger.error(`Invalid file object at index ${index + 1} for reg_id: ${reg_id}. Expected a 'file_data' string.`);
                    res.status(400).json({
                        success: false,
                        message: `Invalid file object at index ${index + 1}. Expected a 'file_data' string.`,
                        reg_id,
                    });
                    return;
                }
            
                const fileBase64 = fileObj.file_data;
            
                // Validate Base64 format
                const match = fileBase64.match(/^data:image\/(png|jpeg|jpg);base64,(.+)$/);
                if (!match) {
                    logger.error(`Invalid Base64 format for file ${index + 1} of reg_id: ${reg_id}`);
                    res.status(400).json({
                        success: false,
                        message: `Invalid Base64 format for file ${index + 1}`,
                        reg_id,
                    });
                    return;
                }
            
                const fileType = match[1]; // File extension (png, jpeg, jpg)
                const fileData = match[2]; // Base64 encoded data
            
                // Decode Base64 data
                const buffer = Buffer.from(fileData, 'base64');
            
                // Generate unique file name
                const fileName = `${sanitizedRegId}_${index + 1}.${fileType}`;
                const filePath = path.join(uploadDir, fileName);
            
                // Write the file to the target directory
                fs.writeFileSync(filePath, buffer);
            
                logger.info(`Saved file: ${fileName} for reg_id: ${reg_id}`);
                filePaths.push(filePath); // Add file path for update
            }

            // Call checkAndUpdateAsset function to update the database with the files' information
            await checkAndUpdate(entity_cd, reg_id, filePaths);

        }

        res.status(200).json({
            success: true,
            message: "Assets updated successfully",
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