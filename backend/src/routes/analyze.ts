import { Router } from "express";
import { analyzeRepository } from "../controllers/analyzeController";

const router = Router();

router.post("/", analyzeRepository);

export default router;

