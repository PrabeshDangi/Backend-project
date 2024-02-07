import dotenv from "dotenv";
import express from "express";
import connectDB from "./db/dbConnect.js";
dotenv.config({ path: "./.env" });
const app = express();

app.on("error", (error) => {
  console.error("Error: ", error);
  throw error;
});
connectDB()
  .then(() => {
    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log("MongoDB connection failed!!", error);
  });

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
