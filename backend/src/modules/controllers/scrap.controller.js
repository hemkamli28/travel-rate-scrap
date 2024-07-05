import { v4 as uuidv4 } from "uuid";
import { spawn } from "child_process";

import {
  checkAndInsertSchedule,
  compareDataAndJoin,
  createComparisonResultsTable,
  deleteAllScheduledRoute,
  deleteScheduledRoute,
  getAllScheduledRoute,
  insertSearchHistoryTable,
  storeFileName,
  storeToCsv,
} from "../../shared/utilities/dbFunctions.js";
import {
  BadGatewayException,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from "../../shared/utilities/errorClasses.js";

export const startScrapping = async (req, res, next) => {
  try {
    const { departureLocation, arrivalLocation, departureDate } = req?.body;
    const obj = {
      departureLocation,
      arrivalLocation,
      departureDate,
    };
    const refId = uuidv4();
    await insertSearchHistoryTable(obj, refId);

    const childProcess = spawn("node", ["src/config/crawler.js"]);

    childProcess?.on("close", async (code) => {
      if (code == 0) {
        await createComparisonResultsTable();

        const resultedData = await compareDataAndJoin(refId);

        const fileName = await storeToCsv(
          resultedData,
          departureLocation,
          arrivalLocation
        );
        await storeFileName(fileName);

        return res?.status(200)?.json({
          success: true,
          message: "Scrapping Completed!",
          data: resultedData,
        });
      } else {
        next(new BadGatewayException("Scrapping with error Failed!"));
      }
    });

    childProcess?.stdout?.on("data", (data) => {
      console.log(`LOGS: ${data}`);
    });

    childProcess.stderr.on("data", (data) => {
      console.error(`child stderr:\n${data}`);
    });
  } catch (error) {
    next(new InternalServerErrorException("Scrapping Failed!"));
  }
};

export const scheduleRoute = async (req, res, next) => {
  try {
    const { departureLocation, departureDate, arrivalLocation, departureDays } =
      req?.body;
    const insertedData = await checkAndInsertSchedule(
      departureLocation,
      departureDate,
      arrivalLocation,
      departureDays,
    );
    if (!insertedData) {
      throw BadRequestException("Failed to schedule");
    }
    return res.status(201).json({
      success: true,
      message: "Route Scheduled Successfully!",
    });
  } catch (error) {
    next(new InternalServerErrorException("Failed to schedule"));
  }
};

export const getScheduledRoutes = async (req, res, next) => {
  try {
    const scheduledRoutes = await getAllScheduledRoute();
    console.log(scheduledRoutes);
    if (!scheduledRoutes) {
      throw new NotFoundException("No Scheduled Routes found");
    }
    return res?.status(200).json({
      success: true,
      message: "Scheduled Routes retrieved",
      data: scheduledRoutes,
    });
  } catch (error) {
    next(new NotFoundException("No Scheduled Routes found"));
  }
};

export const deleteScheduledRouteById = async (req, res, next) => {
  try {
    const { id } = req?.params;
    const scheduledRoute = await deleteScheduledRoute(id);
    if (scheduledRoute) {
      throw new NotFoundException("No Scheduled Route found!");
    }
  } catch (error) {
    next(new NotFoundException("No Scheduled Route founad!"));
  }
};

export const clearAllScheduledRoutes = async (req, res, next) => {
  try {
    const deletedRoutes = await deleteAllScheduledRoute();
    if (!deletedRoutes) {
      throw new NotFoundException("No Scheduled Route found!");
    }
    return res?.status(200).json({
      success: true,
      message: "Scheduled Routes Cleared Successfully!",
    });
  } catch (error) {
    next(new NotFoundException("No Scheduled Route found!"));
  }
};
