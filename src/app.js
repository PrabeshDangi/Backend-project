import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json({ limit: "20kb" })); //This will make server accept data as json form.
app.use(urlencoded({ extended: true, limit: "20kb" })); //This will make server accept data from the url.
app.use(express.static("Public"));
app.use(cookieParser()); //This will make the cookie of user stored in browser to access and allows to perform CRUD opn.

//Routes import
import userRouter from "./routes/userRoute.js";

//Router declaration
app.use("/api/v1/users", userRouter);

export { app };
