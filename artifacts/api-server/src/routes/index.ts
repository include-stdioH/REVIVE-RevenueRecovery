import { Router, type IRouter } from "express";
import healthRouter from "./health";
import reviveRouter from "./revive";

const router: IRouter = Router();

router.use(healthRouter);
router.use(reviveRouter);

export default router;
