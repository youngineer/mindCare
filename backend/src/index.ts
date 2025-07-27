import express from "express";
import dotenv from "dotenv"


dotenv.config();

const PORT = process.env.PORT;
const FRONTEND_URL = process.env.FRONTEND_URL;


const app = express();