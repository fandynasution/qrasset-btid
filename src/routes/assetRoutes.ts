import express from 'express';
import { generateAndSaveQrCode } from '../controllers/QrCodeController';
import { DatanonQr, DatawithQr, DataWhere } from '../controllers/FaAssetController';

const router = express.Router();

router.get("/generate", generateAndSaveQrCode);
router.get("/datanonqr", DatanonQr);
router.get("/datawithqr", DatawithQr);
router.post("/datawhere", DataWhere);

export default router;