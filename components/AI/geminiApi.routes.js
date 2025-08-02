import {Router} from "express"
import { generateEnergyDashboard,  postImgToHtml} from "./geminiApi.controllers.js";
import multer from "multer";
const upload = multer({ dest: "uploads/" });
const geminiApiRouter = Router() ;

geminiApiRouter.post('/image-to-html/:apiKey', upload.single('image'),postImgToHtml)
geminiApiRouter.post('/CreateDashBoard/:apiKey',generateEnergyDashboard)

export default geminiApiRouter; 