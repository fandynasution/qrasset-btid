import express from 'express';
import { generateAndSaveQrCode, generateOneQrCode } from '../controllers/QrCodeController';
import { DatanonQr, DatawithQr, DataWhere, DataUpdatePrint, DataWhereTrx } from '../controllers/FaAssetController';
import { UpdateAsset } from '../controllers/SaveFaAssetController';
import { getStaffData, getStaffDataId, updateStaffData, getStaffDataEmail } from '../controllers/GetDataController';

import { getDivData, getDeptData } from '../controllers/DivDeptDataController';

const router = express.Router();

router.get("/generate", generateAndSaveQrCode);
router.post("/generateqr", generateOneQrCode);
router.get("/datanonqr", DatanonQr);
router.get("/datawithqr", DatawithQr);
router.put('/update-print', DataUpdatePrint);
router.get('/datastaff', getStaffData);
/**
 * @swagger
 * /api/datastaff:
 *   get:
 *     summary: Get Staff Data
 *     description: Run this URL to View Data Staff
 *     tags: [Data Staff]
 *     responses:
 *       200:
 *         description: Successful Select Data 
 *       404:
 *         description: No Data on DB
 *       500:
 *         description: Error Connection to DB
 */
router.post('/datastaffId', getStaffDataId);
/**
 * @swagger
 * /api/datastaffId:
 *   post:
 *     summary: Get Staff Data by staff_id
 *     description: Run this URL to View Data Staff by staff_id
 *     tags: [Data Staff]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               staff_id:
 *                 type: string
 *                 description: Entity code identifier
 *             example:
 *               staff_id: "MGR"
 *     responses:
 *       200:
 *         description: Successful Select Data 
 *       404:
 *         description: No Data on DB
 *       500:
 *         description: Error Connection to DB
 */
router.post('/datastaffEmail', getStaffDataEmail);
/**
 * @swagger
 * /api/datastaffEmail:
 *   post:
 *     summary: Get Staff Data by staff Email
 *     description: Run this URL to View Data Staff by staff Email
 *     tags: [Data Staff]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: Email Address identifier
 *             example:
 *               email: "dania.nurmayanti@ifca.co.id"
 *     responses:
 *       200:
 *         description: Successful Select Data 
 *       404:
 *         description: No Data on DB
 *       500:
 *         description: Error Connection to DB
 */
router.put('/updatestaff', updateStaffData);
/**
 * @swagger
 * /api/updatestaff:
 *   put:
 *     summary: update Staff on Fa Fasset
 *     description: Run this URL to update Staff on Fa Fasset
 *     tags: [Data Staff]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *                 entity_cd:
 *                   type: string
 *                 reg_id:
 *                   type: string
 *                 staff_id:
 *                   type: string
 *                 div_cd:
 *                   type: string
 *                 dept_cd:
 *                   type: string
 *             example:
 *               entity_cd: "01"
 *               reg_id: "002/RNV1/BTID/IV/13"
 *               staff_id: "MGR"
 *               div_cd: "0101"
 *               dept_cd: "01"
 *     responses:
 *       200:
 *         description: Successful Select Data 
 *       404:
 *         description: No Data on DB
 *       500:
 *         description: Error Connection to DB
 */


router.post("/get-asset", DataWhere);
/**
 * @swagger
 * /api/get-asset:
 *   post:
 *     summary: Select QR Asset with specified parameter
 *     description: Run this URL to View QR Asset with specified parameter
 *     tags: [For QR Code Power Apps]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 entity_cd:
 *                   type: string
 *                 reg_id:
 *                   type: string
 *               example:
 *                 entity_cd: "01"
 *                 reg_id: "025/EQP/BTID/VII/18"
 *     responses:
 *       200:
 *         description: Successful Select Data 
 *       404:
 *         description: No Data on DB
 *       500:
 *         description: Error Connection to DB
 */

router.post("/get-asset-trx", DataWhereTrx);

/**
 * @swagger
 * /api/get-asset-trx:
 *   post:
 *     summary: Select QR Asset Audit with specified parameter
 *     description: Run this URL to View QR Asset Audit with specified parameter
 *     tags: [For QR Code Power Apps]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 entity_cd:
 *                   type: string
 *                 reg_id:
 *                   type: string
 *               example:
 *                 entity_cd: "01"
 *                 reg_id: "025/EQP/BTID/VII/18"
 *     responses:
 *       200:
 *         description: Successful Select Data 
 *       404:
 *         description: No Data on DB
 *       500:
 *         description: Error Connection to DB
 */

router.put('/update-asset', UpdateAsset);
/**
 * @swagger
 * /api/update-asset:
 *   put:
 *     summary: Update QR Asset with specified parameters
 *     description: Update QR Asset data by providing necessary parameters including location coordinates.
 *     tags: [For QR Code Power Apps]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               entity_cd:
 *                 type: string
 *                 description: Entity code identifier
 *                 example: "01"
 *               reg_id:
 *                 type: string
 *                 description: Registration ID of the asset
 *                 example: "025/EQP/BTID/VII/18"
 *               location_map:
 *                 type: string
 *                 description: Geographical coordinates (latitude and longitude)
 *                 example: "-8.7142516, 115.223325"
 *               status_review:
 *                 type: string
 *                 description: Status review identifier (1-5)
 *                 example: "5"
 *               notes:
 *                 type: string
 *                 description: Additional notes about the asset
 *                 example: "Main office"
 *               audit_status:
 *                 type: string
 *                 description: Indicates if the asset has been audited ("Y" or "N")
 *                 example: "Y"
 *               files:
 *                 type: array
 *                 description: List of image files in base64 encoding
 *                 items:
 *                   type: object
 *                   properties:
 *                     file_data:
 *                       type: string
 *                       description: Base64 encoded image data.
 *                       example: |
 *                         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAR4AAACw
 *                         CAMAAADudvHOAAAAw1BMVEX///8...
 *                 example:
 *                   - file_data: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAR4AAACw\nCAMAAADudvHOAAAAw1BMVEX///8..."
 *                   - file_data: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAR4AAACw\nCAMAAADudvHOAAAAw1BMVEX///8..."
 *                   - file_data: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAR4AAACw\nCAMAAADudvHOAAAAw1BMVEX///8..."
 *     responses:
 *       200:
 *         description: Successful update of asset data
 *       400:
 *         description: Bad Request, Invalid Parameter
 *       500:
 *         description: Error connecting to the database
 */
router.get('/getDiv', getDivData);
router.get('/getDept', getDeptData);
export default router;