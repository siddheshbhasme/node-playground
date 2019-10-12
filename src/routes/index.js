import movie from './movie';
import { Router } from "express";

const router = Router()
router.use("/api", movie);
export default router;