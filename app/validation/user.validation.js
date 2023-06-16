import { body, matchedData, check } from 'express-validator';
import validateResult from '../helpers/validate.helpers.js';

export const register_user = [
    body('name').notEmpty().withMessage('The name field is required.'),
    body('lastname').notEmpty().withMessage('The lastname field is required.'),
    body('email')
    .notEmpty().withMessage('The email field is required..')
    .isEmail().withMessage('The email field must be a valid email address.'),
    body('password')
    .notEmpty().withMessage('The password field is required.')
    .isLength({ min: 6 }).withMessage('The password field must have at least 6 characters.'),
    body('roles').isArray({ min: 1 }).withMessage('At least one role is required.'),
    (req, res, next) => {
        validateResult(req, res, next)
    }
]

export const login_user = [
    body('email')
    .optional()
    .isEmail().withMessage('The email field must be a valid email address.'),
    body('username')
    .optional()
    .isLength({ min: 3, max: 20 }).withMessage('The username field must be between 3 and 20 characters.'),
    body()
    .custom((value, { req }) => {
        const { email, username } = req.body;
        if (!email && !username) {
            throw new Error('You must provide an email or a username.');
        }
        return true;
    }),
    body('password')
    .notEmpty().withMessage('The password field is required.')
    .isLength({ min: 6 }).withMessage('The password field must have at least 6 characters.'),
    (req, res, next) => {
        validateResult(req, res, next)
    }
]

export const recovery_pass = [
    body('password')
    .notEmpty().withMessage('The password field is required.')
    .isLength({ min: 6 }).withMessage('The password field must have at least 6 characters.'),
    body('confirm_password')
    .custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Passwords do not match.');
        }
        return true;
    }),
    (req, res, next) => {
        validateResult(req, res, next)
    }
]

export const forgotPasswordVal = [
    body()
    .custom((value, { req }) => {
        const { userBody } = req.body;
        if (!userBody) {
            throw new Error('You must provide an email or a username.');
        }
        return true;
    }),
    (req, res, next) => {
        validateResult(req, res, next)
    }
]