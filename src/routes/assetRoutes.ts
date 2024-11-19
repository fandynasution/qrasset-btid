import express from 'express';
import { generateAndSaveQrCode } from '../controllers/QrCodeController';
import { DatanonQr, DatawithQr, DataWhere, DataUpdatePrint } from '../controllers/FaAssetController';

const router = express.Router();



router.get("/generate", generateAndSaveQrCode);
/**
 * @swagger
 * /api/generate:
 *   get:
 *     summary: Generate QR Code
 *     description: Run this URL to Generate QR Code with condition data with NULL QR Code on DB
 *     tags: [For QR Code]
 *     responses:
 *       200:
 *         description: Successful Generate all Data
 *       404:
 *         description: No Data on DB with Empty QR Code (already generate)
 *       500:
 *         description: Erro Connection to DB
 */

router.get("/datanonqr", DatanonQr);
/**
 * @swagger
 * /api/datanonqr:
 *   get:
 *     summary: Select Qr Asset non QR
 *     description: Run this URL to View all Data that does not yet have a QR Code
 *     tags: [For QR Code]
 *     responses:
 *       200:
 *         description: Successful Select Data 
 *       404:
 *         description: No Data on DB with Empty QR Code (already generate)
 *       500:
 *         description: Error Connection to DB
 */


router.get("/datawithqr", DatawithQr);
/**
 * @swagger
 * /api/datawithqr:
 *   get:
 *     summary: Select Qr Asset with QR
 *     description: Run this URL to View all Data that has a QR Code
 *     tags: [For QR Code]
 *     responses:
 *       200:
 *         description: Successful Select Data 
 *       404:
 *         description: No Data on DB with QR Code (dont generate yet)
 *       500:
 *         description: Error Connection to DB
 */


router.post("/datawhere", DataWhere);
/**
 * @swagger
 * /api/datawhere:
 *   post:
 *     summary: Select Qr Asset with specified parameter
 *     description: Run this URL to View Qr Asset with specified parameter
 *     tags: [For QR Code]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               entity_cd:
 *                 type: string
 *                 example: "01"
 *               reg_id:
 *                 type: string
 *                 example: "001/LND/BTID/III/17"
 *     responses:
 *       200:
 *         description: Successful Select Data 
 *       404:
 *         description: No Data on DB
 *       500:
 *         description: Error Connection to DB
 */


router.put('/update-print', DataUpdatePrint);
/**
 * @swagger
 * /api/update-print:
 *   put:
 *     summary: Update Qr Asset after print (allow single object or multiple array)
 *     description: Run this URL to update multiple Qr Assets after print or a single asset.
 *     tags: [For QR Code]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - type: object
 *                 properties:
 *                   entity_cd:
 *                     type: string
 *                     description: Entity code
 *                     example: "01"
 *                   reg_id:
 *                     type: string
 *                     description: Registration ID
 *                     example: "001/SFW/BTID/IV/24"
 *               - type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     entity_cd:
 *                       type: string
 *                       description: Entity code
 *                       example: "01"
 *                     reg_id:
 *                       type: string
 *                       description: Registration ID
 *                       example: "001/SFW/BTID/IV/24"
 *                 example:
 *                   - entity_cd: "01"
 *                     reg_id: "001/SFW/BTID/IV/24"
 *                   - entity_cd: "01"
 *                     reg_id: "175/FF/BTID/XI/2023"
 *     responses:
 *       200:
 *         description: Successful Select Data 
 *       404:
 *         description: No Data on DB
 *       500:
 *         description: Error Connection to DB
 */


export default router;