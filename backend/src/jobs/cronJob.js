import { CronJob } from 'cron';
import { schedulerFunctions } from './schedulerFunctions.js';

export const job = new CronJob(
    '05 13 * * *', // cronTime
    async () => {
        console.log("Cron job triggered");
        try {
            await schedulerFunctions();
        } catch (error) {
            console.error("Error in cron job execution:", error);
        }
    }, // onTick
    null, // onComplete
    true, // start
    'Asia/Kolkata' // timeZone
);
