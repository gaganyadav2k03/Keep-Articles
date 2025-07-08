import express from "express";
import cookieParser from "cookie-parser";
import ai from "./routes/ai.routes";
import userRouter from "./routes/user.routes";
import { errorHandler } from "./middleware/errorHandlers";
import cors from "cors";
import { userData } from "./routes/authData";
import { socketAuthMiddleware } from "./middleware/verifyAccessToken";


const app = express();

app.use(cors({
  origin: 'http://localhost:5173', // Allow frontend origin
  credentials: true, // if you're sending cookies or headers
}));

app.use(express.json());
app.use(cookieParser());
// app.use(socketAuthMiddleware)
app.use(express.urlencoded({ extended: true }));

app.use("/api/ai", ai);
app.use("/api/user", userRouter);

app.use("/api/me", userData);

app.use(errorHandler);
export default app;
