import { body } from 'express-validator';
import validateResult from '../helpers/validate.helpers.js';

export const createCategory = [
    body('name').notEmpty().withMessage('The name field is required.'),
    // body('image')
    // .custom((value, { req }) => {
    //     // if (!req.files || !req.files.image) {
    //     //     throw new Error('Debes enviar un archivo.');
    //     // }

    //     if (!req.files && !req.body.image) {
    //         throw new Error('Debes enviar un archivo o un campo image.');
    //     }
    //     return true;
    // }),
    (req, res, next) => {
        validateResult(req, res, next)
    }
]