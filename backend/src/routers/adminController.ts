import express, { Response } from 'express';
import { userAuth } from '../middlewares/auth.js';
import { AuthenticatedRequest } from '../types/dto/authDto.js';
import { createResponse } from '../utils/responseUtils.js';
import User from '../models/User.js';
import Patient from '../models/Patient.js';
import Therapist from '../models/Therapist.js';
import MoodEntry from '../models/MoodEntry.js';
import ChatBotLog from '../models/ChatBotLog.js';


const adminController = express.Router();


adminController.delete("/users/:userId", userAuth, async(req: AuthenticatedRequest, resp: Response) => {
    const user = req?.user;
    try {
        if(user?.role !== "admin") {
            resp.status(401).json(createResponse("Not Authorized", user?.role || null, null));
            return;
        }

        const userId = req?.params?.userId;
        const userToDelete = await User.findById(userId);
        if(!userToDelete) {
            resp.status(404).json(createResponse("No such user exists", user?.role || null, null));
            return;
        } else if (userToDelete?.role === "admin") {
            resp.status(401).json(createResponse("Not Authorized", user?.role || null, null));
            return;
        }

        let entityToDelete = null;
        if(userToDelete?.role === "therapist") {
            entityToDelete = await Therapist.findOneAndDelete({userId: userToDelete?._id});
        } else {
            const patientId = userToDelete?._id;
            const moodList = MoodEntry.deleteMany({patientId: patientId});
            const chatList = ChatBotLog.deleteMany({userId: patientId});
            entityToDelete = await Patient.findOneAndDelete({userId: patientId});
        }

        const deletedUser = await User.findByIdAndDelete(userId);
        if(!deletedUser) throw new Error("Error while deleting user, try again");

        resp.status(204).json(createResponse("User deleted successfully", user?.role || null, null));
    } catch (error: any) {
        console.error('User deleting error:', error);
        const response = createResponse(
            error.message || "Failed to delete user", 
            user?.role || null, 
            null
        );
        resp.status(500).json(response);
    }
})