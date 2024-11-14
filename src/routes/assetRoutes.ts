import express from 'express';
import { generateAndSaveQrCode } from '../controllers/QrCodeController';

const router = express.Router();

router.get("/generate", generateAndSaveQrCode);

export default router;