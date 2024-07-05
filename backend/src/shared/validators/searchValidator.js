import { body } from 'express-validator';

export const searchValidator = [
  body('departureLocation')
    .notEmpty().withMessage('Source must not be empty')
    .isLength({ min: 3, max: 3 }).withMessage('Source must be exactly 3 characters'),

  body('arrivalLocation')
    .notEmpty().withMessage('Destination must not be empty')
    .isLength({ min: 3, max: 3 }).withMessage('Destination must be exactly 3 characters'),

  body('departureDate')
    .isDate({ format: 'YYYY-MM-DD' }).withMessage('Date must be in YYYY-MM-DD format'),

  // Custom validator to check that source and dest are not the same
  body().custom((value, { req }) => {
    if (req.body.departureLocation === req.body.arrivalLocation) {
      throw new Error('Departure and Arrival location cannot be same');
    }
    return true;
  }),
];

