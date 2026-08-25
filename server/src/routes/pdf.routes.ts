import { Router } from 'express';
import { uploadPdf, uploadPdfs, uploadImages } from '../middlewares/multer.middleware';
import { validateFileContent } from '../middlewares/fileContent.middleware';
import * as pdfController from '../controllers/pdf.controller';

const router = Router();

const pdf = [uploadPdf, validateFileContent('pdf')] as const;

router.post('/merge',          uploadPdfs, validateFileContent('pdf'), pdfController.merge);
router.post('/split',          ...pdf,     pdfController.split);
router.post('/compress',       ...pdf,     pdfController.compress);
router.post('/rotate',         ...pdf,     pdfController.rotate);
router.post('/images-to-pdf',  uploadImages, validateFileContent('image'), pdfController.imagesToPdfHandler);
router.post('/pdf-to-images',  ...pdf,     pdfController.pdfToImagesHandler);

export default router;
