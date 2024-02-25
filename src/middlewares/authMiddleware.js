import { ApiError } from "../utils/apiErrors.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/userModel.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized request error!!");
    }

    const jwtDecodedInfo = jwt.verify(token, process.env.ACCESS_TOKEN);

    const user = await User.findById(jwtDecodedInfo._id);

    if (!user) {
      throw new ApiError(401, "Unauthorized access token!!");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, "Invalid AccessToken");
  }
});
