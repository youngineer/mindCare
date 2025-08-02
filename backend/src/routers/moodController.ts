import express, { Response } from 'express';
import { userAuth } from '../middlewares/auth.js';
import { AuthenticatedRequest } from '../types/dto/authDto.js';
import { createResponse } from '../utils/responseUtils.js';
import MoodEntry from '../models/MoodEntry.js';


const moodController = express.Router();


moodController.post("/mood/add", userAuth, async(req: AuthenticatedRequest, resp: Response): Promise<void> => {
    try {
        const user = req?.user;
        const role = user?.role;
        const moodEntryReq = req?.body?.moodEntryReq;
        
        if(role !== "patient") {
            resp.status(401).json(createResponse("Unauthorized request", user?.role || null, null));
            return;
        }

        console.log(moodEntryReq)

        const patientId = user?._id;
        const mood = new MoodEntry({
            patientId: patientId,
            moodLevel: moodEntryReq?.moodLevel,
            tags: moodEntryReq?.tags
        });

        const savedMood = await mood.save();
        if(!savedMood) {
            resp.status(500).json(createResponse("Failed to save the mood, try again", user?.role || null, null));
            return;
        }

        resp.status(201).json(createResponse("Mood successfully saved!", user?.role || null, {
            dateTime: savedMood?.dateTime,
            moodLevel: savedMood?.moodLevel,
            moodTags: savedMood?.tags
        }));
    } catch (error: any) {
        console.error('Could not save mood:', error);
        const response = createResponse(
            "Could not save mood, try again",
            null,
            null
        );
        resp.status(500).json(response);
    }
});


moodController.get("/mood/get/:date", userAuth, async(req: AuthenticatedRequest, resp: Response): Promise<void> => {
    
})


export default moodController;