import { body } from 'express-validator';

export const createServiceValidator = [
    body('name')
        .exists().withMessage('Service name is required')
        .isString().withMessage('Name must be a string')
        .trim()
        .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),

    body('description')
        .optional()
        .isString().withMessage('Description must be a string')
        .trim()
        .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),

    body('duration')
        .exists().withMessage('Duration is required')
        .isInt({ min: 5, max: 480 }).withMessage('Duration must be between 5 and 480 minutes'),

    body('price')
        .exists().withMessage('Price is required')
        .isFloat({ min: 0 }).withMessage('Price must be a positive number'),

    body('category')
        .exists().withMessage('Category ID is required')
        .isMongoId().withMessage('Invalid Category ID format'),

    body('isActive')
        .optional()
        .isBoolean().withMessage('isActive must be a boolean value')
];
