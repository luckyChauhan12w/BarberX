import { body } from 'express-validator';

export const registerUserValidator = [
    body('fullName')
        .exists().withMessage('Full name is required')
        .isObject().withMessage('Full name must be an object'),

    body('fullName.firstName')
        .exists().withMessage('First name is required')
        .isString().withMessage('First name must be a string')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('First name must be between 2 and 50 characters'),

    body('fullName.lastName')
        .exists().withMessage('Last name is required')
        .isString().withMessage('Last name must be a string')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Last name must be between 2 and 50 characters'),

    body('email')
        .exists().withMessage('Email is required')
        .isEmail().withMessage('Invalid email address')
        .normalizeEmail(),

    body('password')
        .exists().withMessage('Password is required')
        .isString().withMessage('Password must be a string')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long'),

    body('role')
        .optional()
        .isIn(['CUSTOMER', 'ADMIN', 'BARBER'])
        .withMessage('Role must be CUSTOMER, ADMIN, or BARBER')
];
