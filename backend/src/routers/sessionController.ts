import express, { Response } from 'express';
import { userAuth } from '../middlewares/auth.js';
import { AuthenticatedRequest } from '../types/dto/authDto.js';
import { createResponse } from '../utils/responseUtils.js';
import Session from '../models/Session.js';
import User from '../models/User.js';
import { SessionUpdateRequest } from '../types/dto/sessionDto.js';


const sessionController = express.Router();


sessionController.post("/session/add", userAuth, async(req: AuthenticatedRequest, resp: Response): Promise<void> => {
    try {
        const sessionReq = req?.body?.sessionReq;
        const patientId = req?.user?._id;
        if(!sessionReq) {
            resp.status(404).json(createResponse("No sessionInfo found", req?.user?.role || null, null))
            return;
        }

        const therapistId = sessionReq?.therapistId;
        const therapistUser = await User.findById(therapistId);

        if(therapistUser?.role !== 'therapist') {
            resp.status(400).json(createResponse("Invalid booking", req?.user?.role || null, null));
            return;
        }

        const session = new Session({
            patientId: patientId,
            therapistId: therapistId,
            dateTime: sessionReq?.dateTime,
            duration: sessionReq?.duration,
            status: sessionReq?.status,
            rating: sessionReq?.rating
        });

        const savedSession = await session.save();
        resp.status(201).json(createResponse("Session created successfully!", req?.user?.role || null, null))

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


sessionController.put("/session/update", userAuth, async(req: AuthenticatedRequest, resp: Response) => {
    try {
        const sessionUpdateRequest: SessionUpdateRequest = req?.body?.sessionUpdateRequest;
        const sessionId = sessionUpdateRequest?.sessionId;
        if(!sessionUpdateRequest || !sessionId) {
            resp.status(400).json(createResponse("Invalid update request!", req?.user?.role || null, null));
            return;
        }

        const sessionUpdateBody: SessionUpdateRequest = {
            dateTime: sessionUpdateRequest?.dateTime,
            duration: sessionUpdateRequest?.duration,
            rating: sessionUpdateRequest?.rating,
            notes: sessionUpdateRequest?.notes,
            status: sessionUpdateRequest?.status
        }

        const updatedSession = await Session.findByIdAndUpdate(sessionId, sessionUpdateBody);
        if(!updatedSession) {
            resp.status(404).json(createResponse("Session not found", req?.user?.role || null, null));
            return;
        }

        resp.status(202).json(createResponse("Session details updated successfully!", req?.user?.role || null, null));

    } catch (error: any) {
        console.error('Session update failed:', error);
        const response = createResponse(
            error.message || "Session update failed", 
            null, 
            null
        );
        resp.status(500).json(response);
    }
});


sessionController.delete("session/delete", userAuth, async(req: AuthenticatedRequest, resp: Response) => {
    try {
        const sessionId = req?.body?.sessionId;

        if(!sessionId) {
            resp.status(400).json(createResponse("No body found", req?.user?.role || null, null));
            return;
        }

        await Session.findByIdAndDelete(sessionId);
        resp.status(202).json(createResponse("Session deleted successfully!", req?.user?.role || null, null));

    } catch (error: any) {
        console.error('Session update failed:', error);
        const response = createResponse(
            error.message || "Session update failed", 
            null, 
            null
        );
        resp.status(500).json(response);
    }
})


export default sessionController;