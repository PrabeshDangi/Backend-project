import { Router } from "express";
const router = Router();
import { registerUser } from "../controllers/userController.js";
import { upload } from "../middlewares/multer.js";

router.route("/register").post(
  upload.fields([
    {
      name: "avatar", //Yo frontend ma pani avatar naam batai import garinchha..
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

export default router;
