import express, { type IRouter } from "express";
import healthRouter from "./health";
import trafficRouter from "./traffic";
import signalsRouter from "./signals";
import emergencyRouter from "./emergency";
import intersectionsRouter from "./intersections";
import aiInputRouter from "./ai-input";

const router: IRouter = express.Router();

router.use(healthRouter);
router.use(trafficRouter);
router.use(signalsRouter);
router.use(emergencyRouter);
router.use(intersectionsRouter);
router.use("/ai", aiInputRouter);

export default router;
