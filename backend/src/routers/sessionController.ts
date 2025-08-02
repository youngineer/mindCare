import express, { Response } from 'express';
import { userAuth } from '../middlewares/auth.js';
import { AuthenticatedRequest } from '../types/dto/authDto.js';
import { createResponse } from '../utils/responseUtils.js';
import Session from '../models/Session.js';
import User from '../models/User.js';
import { GetSessionsFilter, SessionUpdateRequest } from '../types/dto/sessionDto.js';
import { SessionStatus } from '../types/common.js';
import Therapist from '../models/Therapist.js';


const sessionController = express.Router();


sessionController.post("/session/add", userAuth, async (req: AuthenticatedRequest, resp: Response): Promise<void> => {
    try {
        const sessionReq = req?.body?.sessionReq;
        const patientId = req?.user?._id;
        const role = req?.user?.role;

        // Validate sessionReq presence
        if (!sessionReq) {
            resp.status(400).json(createResponse("No sessionInfo found", role || null, null));
            return;
        }

        // Validate therapistId and dateTime
        const therapistId = sessionReq?.therapistId;
        const dateTime = sessionReq?.dateTime ? new Date(sessionReq.dateTime) : null;
        const duration = Number(sessionReq?.duration) || 60;

        if (!therapistId || !dateTime || isNaN(dateTime.getTime())) {
            resp.status(400).json(createResponse("Therapist ID and valid dateTime are required", role || null, null));
            return;
        }

        // Validate future date
        const now = new Date();
        if (dateTime <= now) {
            resp.status(400).json(createResponse("Session must be scheduled for a future date", role || null, null));
            return;
        }

        // Role-based access control
        if (role !== "patient") {
            resp.status(403).json(createResponse("Only patients can book sessions", role || null, null));
            return;
        }

        // Prevent therapist from booking their own session
        if (patientId === therapistId) {
            resp.status(403).json(createResponse("Cannot book session with yourself", role, null));
            return;
        }

        // Therapist existence and role check
        const therapistUser = await User.findById(therapistId);
        if (!therapistUser || therapistUser.role !== "therapist") {
            resp.status(404).json(createResponse("Therapist not found", role || null, null));
            return;
        }

        // Patient existence and role check
        const patientUser = await User.findById(patientId);
        if (!patientUser || patientUser.role !== "patient") {
            resp.status(403).json(createResponse("Patient profile not found", role || null, null));
            return;
        }

        // Check for duplicate session (same patient, therapist, and dateTime)
        const isSessionExist = await Session.findOne({
            therapistId: therapistId,
            patientId: patientId,
            dateTime: dateTime
        }).exec();

        if (isSessionExist) {
            resp.status(409).json(createResponse("Session already exists at this time", role || null, null));
            return;
        }

        // Check for therapist's overlapping sessions
        const newStart = dateTime;
        const newEnd = new Date(newStart.getTime() + duration * 60000);

        const overlappingSession = await Session.findOne({
            therapistId: therapistId,
            $expr: {
                $and: [
                    { $lt: ["$dateTime", newEnd] },
                    { $gt: [{ $add: ["$dateTime", { $multiply: ["$duration", 60000] }] }, newStart] }
                ]
            }
        }).exec();

        if (overlappingSession) {
            resp.status(409).json(createResponse("Therapist has another session during this time", role || null, null));
            return;
        }

        // Check therapist availability (if availabilitySchedule exists)
        const therapist = await Therapist.findOne({ userId: therapistId }).exec();
        if (!therapist) {
            resp.status(404).json(createResponse("Therapist profile not found", role || null, null));
            return;
        }

        // Only check availability if therapist has set availability schedule
        if (Array.isArray(therapist.availabilitySchedule) && therapist.availabilitySchedule.length > 0) {
            const available = therapist.availabilitySchedule.some(
                (slot) => new Date(slot).getTime() === newStart.getTime()
            );
            if (!available) {
                resp.status(409).json(createResponse("Selected time is not in therapist's availability", role || null, null));
                return;
            }
        }

        // Create session with all required fields
        const session = new Session({
            patientId: patientId,
            therapistId: therapistId,
            dateTime: dateTime
        });

        const savedSession = await session.save();
        if (!savedSession) {
            resp.status(500).json(createResponse("Error occurred, please try again", role || null, null));
            return;
        }

        // Remove booked slot from therapist's availabilitySchedule
        if (Array.isArray(therapist.availabilitySchedule) && therapist.availabilitySchedule.length > 0) {
            therapist.availabilitySchedule = therapist.availabilitySchedule.filter(
                (slot) => new Date(slot).getTime() !== newStart.getTime()
            );
            await therapist.save();
        }

        // Return comprehensive response following MindCare patterns
        resp.status(201).json(createResponse("Session created successfully!", role || null, {
            sessionId: savedSession._id,
            sessionDetails: {
                patientId: savedSession.patientId,
                therapistId: savedSession.therapistId,
                dateTime: savedSession.dateTime,
                duration: savedSession.duration,
                status: savedSession.status,
                notes: savedSession.notes,
                rating: savedSession.rating
            },
            therapistInfo: {
                name: therapistUser.name,
                photoUrl: therapistUser.photoUrl
            }
        }));

    } catch (error: any) {
        console.error('Session booking failed:', error);
        const response = createResponse(
            error.message || "Session booking failed",
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
});


sessionController.delete("/sessions/delete/:sessionId", userAuth, async (req: AuthenticatedRequest, resp: Response) => {
    try {
        const sessionId = req?.params?.sessionId;
        const userId = req?.user?._id;
        if (!sessionId) {
            resp.status(400).json(createResponse("Invalid delete request", req?.user?.role || null, null));
            return;
        }

        const session = await Session.findById(sessionId);
        if (!session) {
            resp.status(404).json(createResponse("Session not found", req?.user?.role || null, null));
            return;
        }
        const userIdStr = String(userId);
        const patientIdStr = String(session.patientId);
        const therapistIdStr = String(session.therapistId);

        if (!(userIdStr === patientIdStr || userIdStr === therapistIdStr)) {
            resp.status(403).json(createResponse("Invalid request", req?.user?.role || null, null));
            return;
        }

        // Find and delete the session
        const sessionToBeDeleted = await Session.findByIdAndDelete(sessionId);
        if (!sessionToBeDeleted) {
            resp.status(404).json(createResponse("Session not found", req?.user?.role || null, null));
            return;
        }

        // Restore the slot to therapist's availabilitySchedule if therapist and dateTime exist
        const therapistId = sessionToBeDeleted.therapistId;
        const sessionDate = sessionToBeDeleted.dateTime;
        const therapist = await Therapist.findOne({ userId: therapistId });

        if (therapist && sessionDate) {
            // Only add if not already present
            const exists = therapist.availabilitySchedule.some(
                (slot: Date) => new Date(slot).getTime() === new Date(sessionDate).getTime()
            );
            if (!exists) {
                therapist.availabilitySchedule.push(sessionDate);
                therapist.availabilitySchedule.sort((a: Date, b: Date) => new Date(a).getTime() - new Date(b).getTime());
                await therapist.save();
            }
        }

        resp.status(200).json(createResponse(
            "Session deleted successfully!",
            req?.user?.role || null,
            null
        ));
    } catch (error: any) {
        console.error('Session deletion failed:', error);
        const response = createResponse(
            error.message || "Session deletion failed",
            null,
            null
        );
        resp.status(500).json(response);
    }
})


export default sessionController;