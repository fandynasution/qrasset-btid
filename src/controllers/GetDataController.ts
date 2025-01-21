import { Request, Response } from "express";
import { GetDataStaff } from "../models/DataStaffModel"
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import { DataItem } from '../types/QrCodeTypes';
import logger from "../logger";
import * as ftp from 'basic-ftp';
import { createLogger, format, transports } from "winston";
import { getFtpDetails } from '../models/QrCodeModel';

// Folder log
const logDir = path.join(__dirname, '../storage/log');

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

export const getStaffDataold = async (req: Request, res: Response) => {
    const storagePath = path.join(__dirname, '..', 'storage', 'qr'); 
    
    if (!fs.existsSync(storagePath)) {
        fs.mkdirSync(storagePath, { recursive: true }); // Create the directory if it doesn't exist
    }

    // Buat logger
    const logger = createLogger({
        level: 'info',
        format: format.combine(
            format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            format.printf(({ timestamp, level, message }) => `${timestamp} [${level.toUpperCase()}]: ${message}`)
        ),
        transports: [
            new transports.File({ filename: path.join(logDir, getLogFileName()) }), // Simpan ke file log harian
        ]
    });

    try {
        const dataStaff = await GetDataStaff();

        if (dataStaff.length === 0) {
            const errorMessage = "No data Staff on Database";
            logger.info(errorMessage); // Log error
            return res.status(404).json({
                success: true,
                message: errorMessage,
            });
        }

        logger.info('Success get Data Staff from Database');

        res.status(200).json({
            success: true,
            message: "Success",
            data: dataStaff
        });
    } catch (error) {
        logger.error(`Error during searching Staff: ${error instanceof Error ? error.message : error}`);
        res.status(500).json({
            success: false,
            message: "Failed to Find Staff",
            error: error instanceof Error ? error.message : "Unknown error occurred",
        });
    }
}

export const getStaffData = async (req: Request, res: Response) => {
    // Buat logger
    const logger = createLogger({
        level: 'info',
        format: format.combine(
            format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            format.printf(({ timestamp, level, message }) => `${timestamp} [${level.toUpperCase()}]: ${message}`)
        ),
        transports: [
            new transports.File({ filename: path.join(logDir, getLogFileName()) }), // Simpan ke file log harian
        ]
    });
    try {
        const datanonQr = await GetDataStaff();

        if (datanonQr.length === 0) {
            const errorMessage = "No data non QR found on Database";
            logger.info(errorMessage); // Log error
            return res.status(404).json({
                success: true,
                message: errorMessage,
            });
        }   
        
        logger.info('Success get Data non QR from Database');

        res.status(200).json({
            success: true,
            message: "Success",
            data: datanonQr
        });
    } catch (error) {
        logger.error(`Failed to Fetch Data: ${error instanceof Error ? error.message : error}`);
        res.status(500).json({
            success: false,
            message: "Failed to Fetch Data",
            error: error instanceof Error ? error.message : "Unknown error occurred",
        });
    }
}