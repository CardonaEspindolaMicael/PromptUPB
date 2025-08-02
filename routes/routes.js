import { Router } from "express";
import geminiApiRouter from "../components/AI/geminiApi.routes.js";


const router = Router(); 
router.use('/ai-gemini',geminiApiRouter)

export default router ;


