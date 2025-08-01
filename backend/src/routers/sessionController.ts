import express, { Response } from 'express';
import { userAuth } from '../middlewares/auth.js';
import { AuthenticatedRequest } from '../types/dto/authDto.js';
import { createResponse } from '../utils/responseUtils.js';
import Session from '../models/Session.js';


const sessionController = express.Router();


sessionController.post("/session/add", userAuth, async(req: AuthenticatedRequest, resp: Response): Promise<void> => {
    try {
        const sessionReq = req?.session;
        if(!sessionReq) {
            resp.status(404).json(createResponse("No sessionInfo found", req?.user?.role || null, null))
        }
        const session = new Session({
            patientId: sessionReq?.patientId,
            therapistId: sessionReq?.therapistId,
            dateTime: sessionReq?.dateTime,
            duration: sessionReq?.duration,
            status: sessionReq?.status,
            notes: sessionReq?.notes,
            rating: sessionReq?.rating
        });

        const savedSession = await session.save();
        resp.status(201).json(createResponse("Session created successfully!", req?.user?.role || null, savedSession))

    } catch (error: any) {
        console.error('Session saving to db failed:', error);
        const response = createResponse(
            error.message || "Could not save to db", 
            null, 
            null
        );
        resp.status(500).json(response);
    }
});