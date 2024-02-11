import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiErrors.js";
import { User } from "../models/userModel.js";
import { cloudianryFileUpload } from "../utils/fileUpload.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, fullname, password } = req.body;

  if (
    [username, email, fullname, password].some(
      (fields) => fields?.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const registeredUser = User.findOne({
    $or: [{ username }, { email }],
  });

  if (registeredUser) {
    throw new ApiError(409, "User already exists");
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar not found!!");
  }

  const avatar = await cloudianryFileUpload(avatarLocalPath);
  const coverImage = await cloudianryFileUpload(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar not found!!");
  }

  const user = await User.create({
    fullname,
    avatar: avatar.url,
    email,
    password,
    coverImage: coverImage?.url || "",
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Error while registration!!");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, "User Registered Successfully!!"));
});

export { registerUser };
