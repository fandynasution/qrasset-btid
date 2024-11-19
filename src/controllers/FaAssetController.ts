import { Request, Response } from "express";
import { GetDatanonQr, GetDataWhere, GetDataWithQr, UpdateDataPrint } from '../models/FaAssetModel';
import { DataItem } from '../types/QrCodeTypes';
import fs from 'fs';
import path from 'path';
import logger from "../logger";

export const DatanonQr = async (req: Request, res: Response) => {
    
    try {
        const datanonQr = await GetDatanonQr();

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

export const DatawithQr = async (req: Request, res: Response) => {
    try {
        const dataWithQr = await GetDataWithQr();

        if (dataWithQr.length === 0) {
            const errorMessage = "No data with QR found on Database";
            logger.error(errorMessage); // Log error
            return res.status(404).json({
                success: true,
                message: errorMessage,
            });
        }

        logger.info('Success get Data with QR from Database');
        
        res.status(200).json({
            success: true,
            message: "Success",
            data: dataWithQr
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

export const DataWhere = async (req: Request, res: Response) => {
    const dataWhereD = req.body;

    const dataArray: DataItem[] = Array.isArray(dataWhereD) ? dataWhereD : [dataWhereD];

    // Validate that each entry has the required fields
    const hasRequiredFields = (detail: DataItem) =>
        detail.entity_cd && detail.reg_id;

    // Check for required fields in each entry
    if (!dataArray.every(hasRequiredFields)) {
        const errorMessage = "entity_cd and reg_id are required";
        logger.error(errorMessage); // Log error
            
        return res.status(400).json({
            success: false,
            message: errorMessage,
        });
    }

    try {
        // Log each entry
        dataArray.forEach((dataItem) => {
            logger.info(`Processing data for entity_cd: ${dataItem.entity_cd} and reg_id: ${dataItem.reg_id}`);
        });

        // Call the function to update the data in the database
        const result = await GetDataWhere(dataArray);

        // Log the successful update to the database
        logger.info(`Success get Data from Database`);

        res.status(200).json({
            success: true,
            message: "Success",
            result,
        });
    } catch (error: unknown) {
        if (error instanceof Error) {
            logger.error(`Failed to Fetch Data Print: ${error instanceof Error ? error.message : error}`);
        
            res.status(500).json({
                success: false,
                message: "Failed to Fetch Data Print",
                error: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        } else {
            logger.error(`Failed to Fetch Data Print: ${error instanceof Error ? error.message : error}`);
        
            res.status(500).json({
                success: false,
                message: "Failed to Fetch Data Print",
                error: "An unknown error occurred"
            });
        }
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
        logger.error(errorMessage); // Log error
            
        return res.status(400).json({
            success: false,
            message: errorMessage,
        });
    }

    try {
        // Log each entry
        dataArray.forEach((dataItem) => {
            logger.info(`Processing data for entity_cd: ${dataItem.entity_cd} and reg_id: ${dataItem.reg_id}`);
        });

        // Call the function to update the data in the database
        const result = await UpdateDataPrint(dataArray);

        // Log the successful update to the database
        logger.info(`Success update data to Database`);

        res.status(200).json({
            result
        });
    } catch (error: unknown) {
        if (error instanceof Error) {
            logger.error(`Failed to update Data Print: ${error instanceof Error ? error.message : error}`);
        
            res.status(500).json({
                success: false,
                message: "Failed to update Data Print",
                error: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        } else {
            logger.error(`Failed to update Data Print: ${error instanceof Error ? error.message : error}`);
        
            res.status(500).json({
                success: false,
                message: "Failed to update Data Print",
                error: "An unknown error occurred"
            });
        }
    }
}