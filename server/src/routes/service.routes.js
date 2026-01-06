import express from 'express';
import { createService, getAllServices } from '../controller/service.controller.js';
import { createServiceValidator } from '../validators/service.validator.js';
import { validate } from '../middlewares/validation/validate.middleware.js';
import { isAdmin } from '../middlewares/auth/auth.middleware.js';

const router = express.Router();

router.get('/', getAllServices);

router.post(
    '/',
    createServiceValidator,
    validate,
    isAdmin,
    createService
);

export default router;
