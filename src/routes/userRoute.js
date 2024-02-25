import { Router } from "express";
import { verifyJWT } from "../middlewares/authMiddleware.js";
const router = Router();
import {
  logOutUser,
  loginUser,
  registerUser,
  generateRefreshAccesstoken,
} from "../controllers/userController.js";
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

router.route("/login").post(loginUser);

//Secured route(Yo route haru access garna user loggedIn hunai parne hunchha!!)
router.route("/logout").post(verifyJWT, logOutUser);
router.route("/refreshToken").post(generateRefreshAccesstoken);

export default router;
