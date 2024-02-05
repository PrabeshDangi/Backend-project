import mongoose from "mongoose";
import express from "express";
import { db_name } from "./constants.js";
const app = express();

(async () => {
  try {
    await mongoose.connect(`${process.env.DB_URL}/${db_name}`);
    app.on("error", (error) => {
      console.error("Error: ", error);
      throw error;
    });
    app.listen(process.env.PORT, () => {
      console.log(`App is running on port ${process.env.PORT}`);
    });
  } catch (error) {
    console.error("Err: ", error);
    throw error;
  }
})();
