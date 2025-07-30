import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { createResponse } from "../utils/responseUtils.js";
import User from "../models/User.js";
import { AuthenticatedRequest } from "../types/dto/authDto.js";

dotenv.config();

const userAuth = async (req: AuthenticatedRequest, resp: Response, next: NextFunction): Promise<void> => {
  try {
    const { token } = req.cookies;

    if (!token) {
      resp.status(401).json(
        createResponse("Authentication token missing", null, null)
      );
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error("JWT_SECRET is not defined in environment variables.");
    }

    const decoded = jwt.verify(token, jwtSecret) as { _id: string };
    const userId: string = decoded._id;

    const user = await User.findById(userId);
    if (!user) {
      resp.status(401).json(
        createResponse("Invalid or expired token. Please log in again.", null, null)
      );
    } else {
        req.user = user;
        next();
    }
    
  } catch (error: any) {
    const response = createResponse(
      error.message || "Unexpected error during authentication",
      null,
      null
    );
    resp.status(400).json(response);
  }
};

export default userAuth;
