import { Router, type IRouter } from "express";
import healthRouter from "./health";
import trafficRouter from "./traffic";
import signalsRouter from "./signals";
import emergencyRouter from "./emergency";
import intersectionsRouter from "./intersections";

const router: IRouter = Router();

router.use(healthRouter);
router.use(trafficRouter);
router.use(signalsRouter);
router.use(emergencyRouter);
router.use(intersectionsRouter);

export default router;
