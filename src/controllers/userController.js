import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiErrors.js";
import { User } from "../models/userModel.js";
import { cloudianryFileUpload } from "../utils/fileUpload.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessRefreshToken = async (userId) => {
  try {
    const requestedUser = await User.findById(userId);
    const accessToken = requestedUser.accessTokenGen();
    const refreshToken = requestedUser.refreshTokenGen();

    requestedUser.refreshToken = refreshToken;
    await requestedUser.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Token generation went wrong!!");
  }
};

const registerUser = asyncHandler(async (req, res, next) => {
  const { username, email, fullname, password } = req.body;

  if (
    [username, email, fullname, password].some(
      (fields) => fields?.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const registeredUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (registeredUser) {
    throw new ApiError(409, "User already exists");
  }

  //Yedi request ma file aako chha ra tesma avatar naam vayeko array chha vane tyo array ko first index ma vako file ko path line
  //const avatarLocalPath = req.files?.avatar[0]?.path;
  let avatarLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.avatar) &&
    req.files.avatar.length > 0
  ) {
    avatarLocalPath = req.files.avatar[0].path;
  }

  //const coverImageLocalPath = req.files?.coverImage[0]?.path;

  let coverImageLocalPath;
  //Yedi req.files ma file upload vako chhaina vane tesko path ma aaune undefined lai handle garne method..
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required!!");
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
    .json(new ApiResponse(200, createdUser, "User Registered Successfully!!"));
});

//Login user
const loginUser = asyncHandler(async (req, res, next) => {
  // req body -> data
  // username or email check garney
  //find the user in DB
  //password check/validate
  //access and referesh token
  //send cookie

  const { email, username, password } = req.body;
  if (!username || !email) {
    throw new ApiError(400, "username or email is required!!");
  }
  const requestedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!requestedUser) {
    throw new ApiError(404, "User not found!!");
  }

  //Yo User ma navayera requestedUser ma hune method ho password check garne kinaki User vaneko mongoose ko method ho tara reqUser vaneko hamile define gareko User ko instance ho

  const ispasswordValid = await requestedUser.isPasswordCorrect(password);

  if (!ispasswordValid) {
    throw new ApiError(400, "Password not valid!!");
  }

  const { refreshToken, accessToken } = await generateAccessRefreshToken(
    requestedUser._id
  );
});

export { registerUser, loginUser };
