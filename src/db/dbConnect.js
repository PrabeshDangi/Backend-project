import mongoose from "mongoose";
import { db_name } from "../constants.js";

const connectDB = async () => {
  try {
    const connectionIns = await mongoose.connect(
      `${process.env.DB_URL}/${db_name}`
    );
    console.log(
      `Database connection successful with ${connectionIns.connection.host}`
    );
  } catch (error) {
    console.log("MongoDB connection error:", error);
    process.exit(1);
  }
};

export default connectDB;
