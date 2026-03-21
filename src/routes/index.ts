import express, { type IRouter } from "express";
import aiInputRouter from "./ai-input";
import dataIngestionRouter from "./data-ingestion";
import emergencyRouter from "./emergency";
import healthRouter from "./health";
import intersectionsRouter from "./intersections";
import settingsRouter from "./settings";
import signalsRouter from "./signals";
import trafficRouter from "./traffic";

const router: IRouter = express.Router();

router.use(healthRouter);
router.use(trafficRouter);
router.use(signalsRouter);
router.use(emergencyRouter);
router.use(intersectionsRouter);
router.use("/ai", aiInputRouter);
router.use(dataIngestionRouter); // New data ingestion endpoints
router.use(settingsRouter); // System settings management

export default router;
