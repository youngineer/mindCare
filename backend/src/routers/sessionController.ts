import express, { Response } from 'express';
import { userAuth } from '../middlewares/auth.js';
import { AuthenticatedRequest } from '../types/dto/authDto.js';
import { createResponse } from '../utils/responseUtils.js';
import Session from '../models/Session.js';
import User from '../models/User.js';
import { GetSessionsFilter, GetSessionsResponse, SessionUpdateRequest } from '../types/dto/sessionDto.js';
import { SessionStatus } from '../types/common.js';


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
        const dateTime = new Date(sessionReq?.dateTime);
        const duration = Number(sessionReq?.duration);

        if(therapistUser?.role !== 'therapist') {
            resp.status(400).json(createResponse("Invalid booking", req?.user?.role || null, null));
            return;
        }

        const newStart = dateTime;
        const newEnd = new Date(newStart.getTime() + duration * 60000);

        const overlappingSessions = await Session.find({
            therapistId: therapistId,
            dateTime: { $lt: newEnd }
        }).exec();

        let isOverlapping = false;
        for (const session of overlappingSessions) {
            const sessionStart = new Date(session.dateTime).getTime();
            const sessionEnd = sessionStart + session.duration * 60000;
            // Overlap if newStart < sessionEnd && newEnd > sessionStart
            if (newStart.getTime() < sessionEnd && newEnd.getTime() > sessionStart) {
                isOverlapping = true;
                break;
            }
        }

        if (isOverlapping) {
            resp.status(400).json(createResponse("The session overlaps with an existing session.", req?.user?.role || null, null));
            return;
        }
        if(overlappingSessions) {
            resp.status(400).json(createResponse("Therapist already has a session during this time", req?.user?.role || null, null));
            return;
        }

        const isSessionExist = await Session.findOne({ 
            therapistId: therapistId, 
            patientId: patientId, 
            dateTime: dateTime
        }).exec();

        if(isSessionExist) {
            resp.status(400).json(createResponse("Timing unavailable", req?.user?.role || null, null));
            return;
        }

        const session = new Session({
            patientId: patientId,
            therapistId: therapistId,
            dateTime: dateTime,
            duration: sessionReq?.duration,
            status: sessionReq?.status,
            rating: sessionReq?.rating
        });

        await session.save();
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
        console.error('Session deletion failed:', error);
        const response = createResponse(
            error.message || "Session deletion failed", 
            null, 
            null
        );
        resp.status(500).json(response);
    }
});


sessionController.get("/sessions/getAll", userAuth, async(req: AuthenticatedRequest, resp: Response) => {
    try {
        const userId = req?.user?._id as string;
        const role = req?.user?.role;
        const patientIdReq = role === "patient" ? userId : (req?.query?.patientId as string | undefined);
        const therapistIdReq = role === "therapist" ? userId : (req?.query?.therapistId as string | undefined);
        const requiredFields = role === "therapist"
            ? "patientId status rating dateTime duration"
            : "therapistId status rating dateTime duration";

        const statusReq = req?.query?.status as string | undefined;
        const from = req?.query?.from ? new Date(req?.query?.from as string) : undefined;
        const to = req?.query?.to ? new Date(req?.query?.to as string) : undefined;

        const filter: GetSessionsFilter = {};
        if (patientIdReq) filter.patientId = patientIdReq;
        if (therapistIdReq) filter.therapistId = therapistIdReq;
        if (statusReq) filter.status = statusReq;
        if (from || to) filter.dateTime = {};
        if (from) filter.dateTime!.$gte = from;
        if (to) filter.dateTime!.$lte = to;

        const filteredSessions = await Session.find(filter, requiredFields).exec();
        const sessions: { [key: string]: { withUser: string; dateTime: Date; duration: number; status: SessionStatus; rating: number } } = {};

        for (const session of filteredSessions) {
            let withUser = "";
            if (role === "patient") {
                const user = await User.findById(session.therapistId);
                withUser = user?.name || "";
            } else if (role === "therapist") {
                const user = await User.findById(session.patientId);
                withUser = user?.name || "";
            }
            sessions[session._id.toString()] = {
                withUser,
                dateTime: session.dateTime,
                duration: session.duration,
                status: session.status as SessionStatus,
                rating: session.rating as number
            };
        }

        resp.status(200).json(createResponse(
            "Sessions fetched successfully!",
            req?.user?.role || null,
            { sessionId: sessions }
        ));
    } catch (error: any) {
        console.error('Session retrieval failed:', error);
        const response = createResponse(
            error.message || "Session retrieval failed",
            null,
            null
        );
        resp.status(500).json(response);
    }
})


export default sessionController;