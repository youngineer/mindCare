import express, { Response } from 'express';
import { userAuth } from '../middlewares/auth.js';
import { AuthenticatedRequest } from '../types/dto/authDto.js';
import { createResponse } from '../utils/responseUtils.js';
import MoodEntry from '../models/MoodEntry.js';
import User from '../models/User.js';
import { MoodUpdateRequest } from '../types/dto/moodEntryDto.js';


const moodController = express.Router();


moodController.post("/mood/add", userAuth, async(req: AuthenticatedRequest, resp: Response): Promise<void> => {
    const user = req?.user;
    const role = user?.role;
    
    try {
        const moodEntryReq = req?.body?.moodEntryReq;
        
        if(role !== "patient") {
            resp.status(401).json(createResponse("Unauthorized request", user?.role || null, null));
            return;
        }

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
    const user = req?.user;
    const role = user?.role;
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
});


moodController.patch("/mood/update", userAuth, async(req: AuthenticatedRequest, resp: Response) => {
    const user = req?.user;
    const role = user?.role;
    try {
        if(role !== "patient") {
            resp.status(403).json(createResponse("Only patients can update mood", user?.role || null, null));
            return;
        }

        const moodUpdateRequest: MoodUpdateRequest = req?.body?.moodUpdateRequest;
        const moodId = moodUpdateRequest?.moodId;
        const moodLevel = moodUpdateRequest?.moodLevel;
        const moodTags = moodUpdateRequest?.tags;

        if (!moodId) {
            resp.status(400).json(createResponse("Mood ID is required", user?.role || null, null));
            return;
        }

        // Only include fields that are provided
        const updatedData: any = {};
        if (typeof moodLevel === "number") updatedData.moodLevel = moodLevel;
        if (Array.isArray(moodTags)) updatedData.tags = moodTags;

        if (Object.keys(updatedData).length === 0) {
            resp.status(400).json(createResponse("No valid data to update", user?.role || null, null));
            return;
        }

        const updatedMood = await MoodEntry.findByIdAndUpdate(
            moodId,
            { $set: updatedData },
            { new: true, runValidators: true }
        );

        if(!updatedMood) {
            resp.status(404).json(createResponse("Mood entry not found", user?.role || null, null));
            return;
        }

        resp.status(200).json(createResponse("Mood updated successfully!", user?.role || null, {
            moodId: updatedMood._id,
            moodLevel: updatedMood.moodLevel,
            tags: updatedMood.tags,
            dateTime: updatedMood.dateTime
        }));

    } catch (error: any) {
        console.error('Could not update mood:', error);
        const response = createResponse(
            "Could not update mood, try again",
            user?.role || null,
            null
        );
        resp.status(500).json(response);
    }
});


moodController.delete("/mood/delete/:moodId", userAuth, async(req: AuthenticatedRequest, resp: Response): Promise<void> => {
    const user = req?.user;
    const role = user?.role;
    try {
        const moodId = req?.params?.moodId;
        const userId = user?._id;

        // Validate moodId presence
        if (!moodId) {
            resp.status(400).json(createResponse("Mood ID is required", user?.role || null, null));
            return;
        }

        // Validate user role - only patients can delete moods
        if (user?.role !== "patient") {
            resp.status(403).json(createResponse("Only patients can delete mood entries", user?.role || null, null));
            return;
        }

        // Find the mood entry
        const mood = await MoodEntry.findById(moodId);
        if (!mood) {
            resp.status(404).json(createResponse("Mood entry not found", user?.role || null, null));
            return;
        }

        // Convert both IDs to strings for proper comparison
        const userIdStr = String(userId);
        const moodPatientIdStr = String(mood.patientId);

        // Only the patient who created the mood can delete it
        if (userIdStr !== moodPatientIdStr) {
            resp.status(403).json(createResponse("You can only delete your own mood entries", user?.role || null, null));
            return;
        }

        // Delete the mood entry
        const deletedMood = await MoodEntry.findByIdAndDelete(moodId);
        if (!deletedMood) {
            resp.status(500).json(createResponse("Failed to delete mood entry", user?.role || null, null));
            return;
        }

        resp.status(200).json(createResponse(
            "Mood entry deleted successfully!", 
            user?.role || null, 
            {
                deletedMoodId: moodId,
                deletedAt: new Date().toISOString()
            }
        ));

    } catch (error: any) {
        console.error('Could not delete mood:', error);
        if (error.name === 'CastError') {
            resp.status(400).json(createResponse("Invalid mood ID format", role || null, null));
            return;
        }

        const response = createResponse(
            "Could not delete mood, try again",
            null,
            null
        );
        resp.status(500).json(response);
    }
});


export default moodController;