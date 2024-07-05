import { body, oneOf } from 'express-validator';

export const registerValidator = [
  body('username')
  .notEmpty().withMessage('Username should not be empty')
  .isLength({ min: 3 }).withMessage('Username must be 3 characters or more'),
  
  body('email')
  .notEmpty().withMessage('Email should not be empty')
  .isEmail().withMessage('Enter a valid Email'),
  
  body('password')
  .notEmpty().withMessage('Password must not be empty')
  .isLength({ min: 7 }).withMessage('Password must be 7 characters or more')
  .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
  .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
  .matches(/[0-9]/).withMessage('Password must contain at least one number')
  .matches(/[@$!%*?&]/).withMessage('Password must contain at least one special character (@, $, !, %, *, ?, &)')
  ];
  
  

export const loginValidator = [
  oneOf([body('username').notEmpty(), body('email').notEmpty().isEmail()], {
    message: 'username or email should be valid',
  }),
 
  body('password')
    .notEmpty().withMessage('Password must not be empty')
    .isLength({ min: 7 }).withMessage('Password must be 7 characters or more')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number')
    .matches(/[@$!%*?&]/).withMessage('Password must contain at least one special character (@, $, !, %, *, ?, &)')
];
