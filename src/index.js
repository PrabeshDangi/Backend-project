import dotenv from "dotenv";
import express from "express";
import connectDB from "./db/dbConnect.js";
dotenv.config({ path: "./.env" });
const app = express();

connectDB();

//Immediately invoked function expression: IIFE
// (async () => {
//   try {
//     await mongoose.connect(`${process.env.DB_URL}/${db_name}`);
//     app.on("error", (error) => {
//       console.error("Error: ", error);
//       throw error;
//     });
//     app.listen(process.env.PORT, () => {
//       console.log(`App is running on port ${process.env.PORT}`);
//     });
//   } catch (error) {
//     console.error("Err: ", error);
//     throw error;
//   }
// })();
