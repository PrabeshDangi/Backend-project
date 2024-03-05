import { Router } from "express";
import { verifyJWT } from "../middlewares/authMiddleware.js";
const router = Router();
import {
  registerUser,
  loginUser,
  logOutUser,
  generateRefreshAccesstoken,
  changeCurrentPassword,
  currentUser,
  updateUserDetails,
  updateUserAvatar,
  updateCoverImage,
  getChannelProfile,
  getWatchHistory,
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

router.route("/changepassword").post(verifyJWT, changeCurrentPassword);

router.route("/currentuser").get(verifyJWT, currentUser);

router.route("/updateDetail").patch(verifyJWT, updateUserDetails);

router
  .route("/updateavatar")
  .patch(verifyJWT, upload.single("avatar"), updateUserAvatar);

router
  .route("/updatecoverimage")
  .patch(verifyJWT, upload.single("coverImage"), updateCoverImage);

router.route("/channel/:username").get(verifyJWT, getChannelProfile);
router.route("/watchhistory").get(verifyJWT, getWatchHistory);

export default router;
