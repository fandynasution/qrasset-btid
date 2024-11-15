import { Request, Response } from "express";
import { GetDatanonQr, GetDataWhere, GetDataWithQr } from '../models/FaAssetModel';


export const DatanonQr = async (req: Request, res: Response) => {
    try {
        const datanonQr = await GetDatanonQr();

        if (datanonQr.length === 0) {
            return res.status(404).json({
                success: true,
                message: "No data found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Success",
            data: datanonQr
        });
    } catch (error) {
        console.error("Failed to Fetch Data:", error);
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
            return res.status(404).json({
                success: true,
                message: "No data found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Success",
            data: dataWithQr
        });
    } catch (error) {
        console.error("Failed to Fetch Data:", error);
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
            return res.status(400).json({
                success: false,
                message: "entity_cd and reg_id are required",
            });
        }

        const data = await GetDataWhere(entity_cd, reg_id);

        if (data.length === 0) {
            return res.status(404).json({
                success: true,
                message: "No data found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Success",
            data: data,
        });
    } catch (error) {
        console.error("Failed to Fetch Data:", error);
        res.status(500).json({
            success: false,
            message: "Failed to Fetch Data",
            error: error instanceof Error ? error.message : "Unknown error occurred",
        });
    }
}