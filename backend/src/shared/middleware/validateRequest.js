import { validationResult } from 'express-validator';
import { BadRequestException, NotAcceptableException } from '../utilities/errorClasses.js';

export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const extractedErrors = errors.array().map(err => err.msg);
    throw new NotAcceptableException(extractedErrors.join(', '));
  } else {
    next();
  }
};


