import express from "express";
import cors from "cors";

import userRoutes from "./modules/routes/userRoutes.js";
import scrapRoutes from "./modules/routes/scrapRoutes.js";

import { errorHandler } from "./shared/utilities/errorHandler.js";
import { job } from "./jobs/cronJob.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/user", userRoutes);
app.use("/scrap", scrapRoutes)
app.use(errorHandler);

// job.start()
app.listen(process.env.PORT, () => {
  console.log(`Example app listening on port ${process.env.PORT}`);
});
