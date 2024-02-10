import { Router } from "express";
const router = Router();
import { registerUser } from "../controllers/userController.js";

router.route("/register").post(registerUser);

export default router;
