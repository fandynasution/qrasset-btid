import express from 'express';
import { generateAndSaveQrCode } from '../controllers/QrCodeController';
import { DatanonQr, DatawithQr, DataWhere } from '../controllers/FaAssetController';

const router = express.Router();



router.get("/generate", generateAndSaveQrCode);
/**
 * @swagger
 * /api/generate:
 *   get:
 *     summary: Generate QR Code
 *     description: Run this URL to Generate QR Code with condition data with NULL QR Code on DB
 *     tags: [For Request Generate QR COde]
 *     responses:
 *       200:
 *         description: Successful Generate all Data
 *       404:
 *         description: No Data on DB with Empty QR Code (already generate)
 *       500:
 *         description: Erro Connection to DB
 */

router.get("/datanonqr", DatanonQr);
router.get("/datawithqr", DatawithQr);
router.post("/datawhere", DataWhere);

export default router;