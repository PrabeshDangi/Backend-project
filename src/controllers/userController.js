import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiErrors.js";
import { User } from "../models/userModel.js";
import { cloudianryFileUpload } from "../utils/fileUpload.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Jwt from "jsonwebtoken";

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
  if (!(username || email)) {
    throw new ApiError(400, "username or email is required!!");
  }
  const requestedUser = await User.findOne({
    $or: [{ username }, { email }], //Find user based on email or username...
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

  const loggedInUser = await User.findById(requestedUser._id).select(
    "-password -refreshToken"
  );

  //Cookie lai server le matra modify garauna milne garaune...
  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged In Successfully"
      )
    );
});

//logout User
const logOutUser = asyncHandler(async (req, res) => {
  //Refresh token generate gareko chhaina vane cookie clear gare matra puchha tara yedi chha vane cookie clear
  // sang sangai refreshToken lai pani DB bata hataunu parne hunchha!!

  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully!!"));
});

//Generate refreshAccessToken
const generateRefreshAccesstoken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookie.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized refresh Token!!");
  }

  try {
    const decodedRefreshToken = Jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN
    );
    const user = await User.findById(decodedRefreshToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid Refresh Token!!");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh Token Expired!!");
    }
    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newRefreshToken } = await generateAccessRefreshToken(
      user._id
    );

    res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshTokenefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "AccessToken regenerated!!"
        )
      );
  } catch (error) {
    throw new ApiError(400, error?.message || "Invalid refresh token!!");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;

  //Yeha samma aaipugda user already loggedIn hunchha ra tyo user ko data hamile authmiddleware bata req.user ko rup ma lina sakchhau!!
  const user = await User.findById(req.user?._id);

  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid Password!!");
  }

  if (newPassword != confirmPassword) {
    throw new ApiError(400, "Please confirm your password!!");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully!!"));
});

const currentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(200, res.user, "Current User fetched successfully!!");
});

const updateUserDetails = asyncHandler(async (req, res) => {
  const { email, fullname } = req.body;

  if ([email, fullname].some((fields) => fields?.trim() === "")) {
    throw new ApiError(400, "Enter all the details!!");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullname: fullname,
        email: email,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "User details uptaded successfully!!"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file missing.");
  }

  const avatar = await cloudianryFileUpload(avatarLocalPath);

  if (!avatar.url) {
    throw new ApiError(400, "Error while uploading the Avatar!!");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(201)
    .json(new ApiResponse(200, user, "Avatar file updated successfully!!"));
});

//CoverImage Update
const updateCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;

  if (!coverImageLocalPath) {
    throw new ApiError(400, "Cover Image file missing.");
  }

  const coverImage = await cloudianryFileUpload(coverImageLocalPath);

  if (!coverImage.url) {
    throw new ApiError(400, "Error while uploading the Cover Image!!");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "CoverImage updated successfully!!"));
});

export {
  registerUser,
  loginUser,
  logOutUser,
  generateRefreshAccesstoken,
  changeCurrentPassword,
  currentUser,
  updateUserDetails,
  updateUserAvatar,
  updateCoverImage,
};
