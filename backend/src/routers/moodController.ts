import express, { Response } from 'express';
import { userAuth } from '../middlewares/auth.js';
import { AuthenticatedRequest } from '../types/dto/authDto.js';
import { createResponse } from '../utils/responseUtils.js';
import MoodEntry from '../models/MoodEntry.js';
import User from '../models/User.js';
import { Mongoose } from 'mongoose';


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


moodController.get("/mood/get", userAuth, async(req: AuthenticatedRequest, resp: Response): Promise<void> => {
    try {
        const fromDate = req?.query?.from;
        const toDate = req?.query?.to;
        const onDate = req?.query?.on;
        const user = req?.user;
        const userId = user?._id;
        const filter: any = {};
        let name = null;

        if(user?.role === "patient") {
            filter.patientId = userId as string;
            name = user?.name;
        } else if(req?.query?.patientId) {
            filter.patientId = req?.query?.patientId as string;
            name = await User.findOne({_id: req?.query?.patientId}, "name").exec();
        } else {
            resp.status(400).json(createResponse("Bad request", user?.role || null, null));
            return;
        }
        
        if(onDate) {
            const date = new Date(onDate.toString());
            const nextDay = new Date(date);
            nextDay.setDate(date.getDate() + 1);
            filter.dateTime = { $gte: date, $lt: nextDay };
        } else {
            if (fromDate || toDate) {
                filter.dateTime = {};
                if (fromDate) filter.dateTime.$gte = new Date(fromDate.toString());
                if (toDate) filter.dateTime.$lte = new Date(toDate.toString());
            }
        };

        const mood = await MoodEntry.find(filter, "patientId moodLevel dateTime tags").exec();
        let message = "No moods found";
        if(mood.length > 0) {
            message = "Mood retrieved successfully!";
        }
        resp.status(200).json(createResponse(message, user?.role || null, mood));

    } catch (error: any) {
        console.error('Could not fetch mood:', error);
        const response = createResponse(
            "Could not save mood, try again",
            null,
            null
        );
        resp.status(500).json(response);
    }
})


export default moodController;