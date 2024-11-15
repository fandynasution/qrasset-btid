import express from 'express';
import { generateAndSaveQrCode } from '../controllers/QrCodeController';
import { DatanonQr, DatawithQr, DataWhere } from '../controllers/FaAssetController';

const router = express.Router();



router.get("/generate", generateAndSaveQrCode);
/**
 * @swagger
 * /api/generate:
 *   post:
 *     summary: Login user
 *     description: Authenticate user with email and password to get token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "mgr@ifca.co.id"
 *               password:
 *                 type: string
 *                 example: "1fc41fc4"
 *     responses:
 *       200:
 *         description: Successful login
 *       401:
 *         description: Invalid credentials
 */

router.get("/datanonqr", DatanonQr);
router.get("/datawithqr", DatawithQr);
router.post("/datawhere", DataWhere);

export default router;