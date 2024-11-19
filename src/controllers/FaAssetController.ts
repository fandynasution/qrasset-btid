import { Request, Response } from "express";
import { GetDatanonQr, GetDataWhere, GetDataWithQr, UpdateDataPrint } from '../models/FaAssetModel';
import { DataItem } from '../types/QrCodeTypes';
import fs from 'fs';
import path from 'path';

const logFilePath = path.join(__dirname, '../storage/log', `log-${new Date().toISOString().split('T')[0]}.txt`); // Log file per day


export const DatanonQr = async (req: Request, res: Response) => {
    
    try {
        const datanonQr = await GetDatanonQr();

        if (datanonQr.length === 0) {
            const errorMessage = "No data found";
            
            // Log error
            const logMessage = `${new Date().toISOString()} - ERROR: ${errorMessage}\n`;
            fs.appendFileSync(logFilePath, logMessage);

            return res.status(404).json({
                success: true,
                message: errorMessage,
            });
        }   
        // Log error
        const logMessage = `${new Date().toISOString()} - INFO: SUCCESS\n`;
        fs.appendFileSync(logFilePath, logMessage);

        res.status(200).json({
            success: true,
            message: "Success",
            data: datanonQr
        });
    } catch (error) {
        console.error("Failed to Fetch Data:", error);
        const logMessage = `${new Date().toISOString()} - ERROR: ${error}\n`;
        fs.appendFileSync(logFilePath, logMessage);
        res.status(500).json({
            success: false,
            message: "Failed to Fetch Data",
            error: error instanceof Error ? error.message : "Unknown error occurred",
        });
    }
}

export const DatawithQr = async (req: Request, res: Response) => {
    try {
        const dataWithQr = await GetDataWithQr();

        if (dataWithQr.length === 0) {
            const errorMessage = "No data found";
            
            // Log error
            const logMessage = `${new Date().toISOString()} - ERROR: ${errorMessage}\n`;
            fs.appendFileSync(logFilePath, logMessage);

            return res.status(404).json({
                success: true,
                message: errorMessage,
            });
        }

        const logMessage = `${new Date().toISOString()} - INFO: SUCCESS\n`;
        fs.appendFileSync(logFilePath, logMessage);

        res.status(200).json({
            success: true,
            message: "Success",
            data: dataWithQr
        });
    } catch (error) {
        console.error("Failed to Fetch Data:", error);
        const logMessage = `${new Date().toISOString()} - ERROR: ${error}\n`;
        fs.appendFileSync(logFilePath, logMessage);
        res.status(500).json({
            success: false,
            message: "Failed to Fetch Data",
            error: error instanceof Error ? error.message : "Unknown error occurred",
        });
    }
}

export const DataWhere = async (req: Request, res: Response) => {
    try {
        const {entity_cd, reg_id} = req.body;

        if (!entity_cd || !reg_id) {
            const errorMessage = "entity_cd and reg_id are required";
            
            // Log error
            const logMessage = `${new Date().toISOString()} - ERROR: ${errorMessage}\n`;
            fs.appendFileSync(logFilePath, logMessage);

            return res.status(400).json({
                success: false,
                message: errorMessage,
            });
        }

        const data = await GetDataWhere(entity_cd, reg_id);

        if (data.length === 0) {
            const errorMessage = "No data found";
            
            // Log error
            const logMessage = `${new Date().toISOString()} - ERROR: ${errorMessage}\n`;
            fs.appendFileSync(logFilePath, logMessage);

            return res.status(404).json({
                success: true,
                message: errorMessage,
            });
        }   
        // Log error
        const logMessage = `${new Date().toISOString()} - INFO: SUCCESS\n`;
        fs.appendFileSync(logFilePath, logMessage);

        res.status(200).json({
            success: true,
            message: "Success",
            data: data,
        });
    } catch (error) {
        const logMessage = `${new Date().toISOString()} - ERROR: ${error}\n`;
        fs.appendFileSync(logFilePath, logMessage);
        res.status(500).json({
            success: false,
            message: "Failed to Fetch Data",
            error: error instanceof Error ? error.message : "Unknown error occurred",
        });
    }
}

export const DataUpdatePrint = async (req: Request, res: Response) => {
    const printUpdateDataD = req.body;

    // Check if the input is an array or a single object, then normalize it to an array
    const dataArray: DataItem[] = Array.isArray(printUpdateDataD) ? printUpdateDataD : [printUpdateDataD];

    // Validate that each entry has the required fields
    const hasRequiredFields = (detail: DataItem) =>
        detail.entity_cd && detail.reg_id;

    // Check for required fields in each entry
    if (!dataArray.every(hasRequiredFields)) {
        const errorMessage = "entity_cd and reg_id are required";
            
        // Log error
        const logMessage = `${new Date().toISOString()} - ERROR: ${errorMessage}\n`;
        fs.appendFileSync(logFilePath, logMessage);

            
        return res.status(400).json({
            success: false,
            message: errorMessage,
        });
    }

    try {
        const result = await UpdateDataPrint(dataArray);   
        // Log error
        const logMessage = `${new Date().toISOString()} - INFO: SUCCESS Update Status\n`;
        fs.appendFileSync(logFilePath, logMessage);

        res.status(200).json({
            result
        });
    } catch (error: unknown) {
        if (error instanceof Error) {
            const logMessage = `${new Date().toISOString()} - ERROR: ${error}\n`;
            fs.appendFileSync(logFilePath, logMessage);
        
            res.status(500).json({
                success: false,
                message: "Failed to update Data Print",
                error: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        } else {
            const logMessage = `${new Date().toISOString()} - ERROR: "An unknown error occurred"\n`;
            fs.appendFileSync(logFilePath, logMessage);
        
            res.status(500).json({
                success: false,
                message: "Failed to update Data Print",
                error: "An unknown error occurred"
            });
        }
    }
}