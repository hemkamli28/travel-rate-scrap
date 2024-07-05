import express from "express";

import { searchValidator } from "../../shared/validators/searchValidator.js";
import { validateRequest } from "../../shared/middleware/validateRequest.js";
import { clearAllScheduledRoutes, deleteScheduledRouteById, getScheduledRoutes, scheduleRoute, startScrapping } from "../controllers/scrap.controller.js";
import { clearAllHistory, deleteHistoryById, downloadExcel, getAllHistory } from "../controllers/history.controller.js";
import { authUser } from "../../shared/middleware/authUser.js";

//express Router
const router = express.Router();

//ALl get request for scraping
router.get("/download/:filename", authUser, downloadExcel);
router.get("/history" , getAllHistory);
router.get("/scheduled", authUser, getScheduledRoutes)


//All post requests
router.post("/start", authUser,searchValidator, validateRequest, startScrapping);
router.post("/schedule", authUser, scheduleRoute)

//All delete Requests for searched History 
router.delete("/history/:id", authUser, deleteHistoryById);
router.delete("/clear-history",authUser, clearAllHistory);
router.delete("/scheduled/:id", authUser, deleteScheduledRouteById);
router.delete("/clear-scheduled", authUser, clearAllScheduledRoutes)

export default router;