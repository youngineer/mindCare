import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectToDatabase from "./config/database.js";
import authRouter from "./routers/authController.js";
import patientController from "./routers/patientController.js";
import therapistController from "./routers/therapistController.js";
import sessionController from "./routers/sessionController.js";
import moodController from "./routers/moodController.js";
import taskController from "./routers/taskController.js";
import chatBotController from "./routers/chatBotController.js";
import { generateReports, generateSummary } from "./utils/cronScheduler.js";

dotenv.config();

const PORT: string = process.env.PORT || "3000";
const FRONTEND_URL: string = process.env.FRONTEND_URL || "http://localhost:5173";


const app = express();
app.use(
    cors({
        credentials: true, // for jwt token processing
        origin: FRONTEND_URL //only process the requests from one frontend server
    })
);
app.use(express.json()); // process json values from the frontend
app.use(cookieParser()); // cookie-parser

app.use("/", authRouter);
app.use("/", patientController);
app.use("/", therapistController);
app.use("/", sessionController);
app.use("/", moodController);
app.use("/", taskController);
app.use("/", chatBotController);

connectToDatabase()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Successfully listening on port: ${PORT}`);
        });
    })
    .catch((e) => {
        console.error(`Error while connecting to db: ${e}`);
        process.exit(1);
    });

generateReports.start();