import { Router } from 'express';
import { uploadImage } from '../middlewares/multer.middleware';
import { validateFileContent } from '../middlewares/fileContent.middleware';
import * as imageController from '../controllers/image.controller';

const router = Router();

const image = [uploadImage, validateFileContent('image')] as const;

// All image tool routes map: /api/image/:operation
router.post('/convert',    ...image,  imageController.convert);
router.post('/compress',   ...image,  imageController.compress);
router.post('/resize',     ...image,  imageController.resize);
router.post('/rotate',     ...image,  imageController.rotate);
router.post('/flip',       ...image,  imageController.flip);
router.post('/crop',       ...image,  imageController.crop);

// Format-specific convert shortcuts
router.post('/to-png',  ...image, (req, res, next) => {
  req.body.outputFormat = 'image/png';
  req.body.quality = req.body.quality ?? '100';
  return imageController.convert(req, res, next);
});
router.post('/to-jpg',  ...image, (req, res, next) => {
  req.body.outputFormat = 'image/jpeg';
  return imageController.convert(req, res, next);
});
router.post('/to-webp', ...image, (req, res, next) => {
  req.body.outputFormat = 'image/webp';
  return imageController.convert(req, res, next);
});
router.post('/to-avif', ...image, (req, res, next) => {
  req.body.outputFormat = 'image/avif';
  return imageController.convert(req, res, next);
});

export default router;
