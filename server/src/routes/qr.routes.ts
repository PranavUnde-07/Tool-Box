import { Router } from 'express';
import multer from 'multer';
import * as qrController from '../controllers/qr.controller';

const router = Router();

// Accept field-only bodies (JSON, urlencoded or multipart without files)
const formFields = multer().none();

router.post('/generate', formFields, qrController.generate);

export default router;
