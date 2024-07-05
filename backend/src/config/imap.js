import dotenv from 'dotenv';

dotenv.config();

export const imapConfig = {
    user: process.env.TBO_USER_EMAIL,
    password: process.env.TBO_USER_PASSWORD,
    host: process.env.TBO_USER_HOST,
    port: 993,
    tls: true,
    tlsOptions: {rejectUnauthorized: false}
  };