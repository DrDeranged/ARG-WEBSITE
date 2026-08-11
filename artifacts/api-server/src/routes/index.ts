import { Router, type IRouter } from "express";
import healthRouter from "./health";
import contactRouter from "./contact";
import assistRouter from "./assist";

const router: IRouter = Router();

router.use(healthRouter);
router.use(contactRouter);
router.use(assistRouter);

export default router;
