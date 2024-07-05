import Imap from 'imap';
import { simpleParser } from 'mailparser';
import { imapConfig } from '../../../config/imap.js';

export const getEmails = async () => {
    try {
      const imap = new Imap(imapConfig);
  
      await new Promise((resolve, reject) => {
        imap?.once('ready', () => {
          imap?.openBox('INBOX', false, () => {
            resolve();
          });
        });
  
        imap?.once('error', err => {
          reject(err);
        });
  
        imap?.connect();
      });
  
      const results = await new Promise((resolve, reject) => {
        imap?.search(['UNSEEN',['SINCE', new Date()], ['TEXT', 'TBO - One Time Password(OTP)']], (err, results) => {
          if (err) {
            reject(err);
            return;
          }
  
          results.sort((a, b) => b - a);
  
          resolve(results);
        });
      });
  
      const latestEmailUID = results[0];
  
      const parsed = await new Promise((resolve, reject) => {
        const f = imap?.fetch(latestEmailUID, { bodies: '' });
        f?.on('message', msg => {
          msg?.on('body', stream => {
            simpleParser(stream, (err, parsed) => {
              if (err) {
                reject(err);
                return;
              }
              resolve(parsed);
            });
          });
          
          msg?.once('attributes', attrs => {
            const { uid } = attrs;
            imap?.addFlags(uid, ['\\Seen'], () => {
              console.log('Marked as read!');
            });
          });
        });

        f?.once('error', ex => {
          reject(ex);
        });

        f?.once('end', () => {
          imap?.end();
        });
      });
  
      const otpRegex = /(\d{6})/; 
      const match = parsed?.text?.match(otpRegex);
      const otp = match ? match[1] : null;
  
      return otp;
    } catch (err) {
      console.error('An error occurred:', err);
    }
  };
  