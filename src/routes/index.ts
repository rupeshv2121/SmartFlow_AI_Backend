import { Router, type IRouter } from "express";
import aiInputRouter from "./ai-input";
import emergencyRouter from "./emergency";
import healthRouter from "./health";
import intersectionsRouter from "./intersections";
import signalsRouter from "./signals";
import trafficRouter from "./traffic";
import vehiclesRouter from "./vehicles";

const router: IRouter = Router();

router.use(healthRouter);
router.use(trafficRouter);
router.use(signalsRouter);
router.use(emergencyRouter);
router.use(intersectionsRouter);
router.use(vehiclesRouter);
router.use("/ai", aiInputRouter);

export default router;
