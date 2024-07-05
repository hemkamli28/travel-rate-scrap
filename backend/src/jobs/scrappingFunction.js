import { v4 as uuidv4 } from "uuid";
import { compareDataAndJoin, createComparisonResultsTable, insertSearchHistoryTable, storeFileName, storeToCsv } from "../shared/utilities/dbFunctions.js";
import { BadGatewayException } from "../shared/utilities/errorClasses.js";
import { spawn } from "child_process";

export const scrappingFunction = async (obj) => {
    try {
        const refId = uuidv4();
        await insertSearchHistoryTable(obj, refId);

        const childProcess = spawn("node", ["src/config/crawler.js"]);

        return new Promise((resolve, reject) => {
            childProcess.on("close", async (code) => {
                if (code == 0) {
                    try {
                        await createComparisonResultsTable();
                        const resultedData = await compareDataAndJoin(refId);
                        const fileName = await storeToCsv(resultedData, obj.departureLocation, obj.arrivalLocation);
                        await storeFileName(fileName);
                        resolve(true);
                    } catch (innerError) {
                        reject(innerError);
                    }
                } else {
                    reject(new BadGatewayException("Scrapping with error Failed!"));
                }
            });

            childProcess.stdout.on("data", (data) => {
                console.log(`LOGS: ${data}`);
            });

            childProcess.stderr.on("data", (data) => {
                console.error(`child stderr:\n${data}`);
            });
        });
    } catch (error) {
        console.error('Error in scrappingFunction:', error);
        throw error;
    }
};
