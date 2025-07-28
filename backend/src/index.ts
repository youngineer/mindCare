import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectToDatabase from "./config/database.js";

dotenv.config();

const PORT: string = process.env.PORT || "3000";
const FRONTEND_URL: string = process.env.FRONTEND_URL || "http://localhost:5173";


const app = express();
app.use(
    cors({
        credentials: true, // for jwt token processing
        origin: PORT //only process the requests from one frontend server
    })
);
app.use(express.json()); // process json values from the frontend
app.use(cookieParser()); // cookie-parser


connectToDatabase()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Successfully listening on port: ${PORT}`);
        })
    })
    .catch((e) => {
        console.error(`Error while connecting to db: ${e}`);
});