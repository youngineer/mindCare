import express, { Response } from 'express';
import { userAuth } from '../middlewares/auth.js';
import { AuthenticatedRequest } from '../types/dto/authDto.js';
import { createResponse } from '../utils/responseUtils.js';
import { PATIENT_CHATBOT_PROMPT } from '../utils/constants.js';
import { getAiChatResponse } from '../utils/aiResponse.js';
import ChatBotLog from '../models/ChatBotLog.js';
import User from '../models/User.js';
import { Role } from '../types/common.js';
import MoodEntry from '../models/MoodEntry.js';

const chatBotController = express.Router();


chatBotController.post("/chatBot/add", userAuth, async(req: AuthenticatedRequest, resp: Response) => {
    const user = req?.user;

    try {
        const message = req?.body?.patientMessage as string;
        if(!message) {
            resp.status(400).json(createResponse("Invalid request: missing message", user?.role || null, null));
            return;
        }
        
        const startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date();
        endDate.setHours(23, 59, 59, 999);

        const todaysMessagesWithID = await ChatBotLog.find({userId: user?._id}, "userMessage", {
            $gte: startDate, $lte: endDate
        });

        const todaysMoodWithId = await MoodEntry.find({patientId: user?._id}, "moodLevel", {
            $gte: startDate, $lte: endDate
        });

        const todaysMessages = todaysMessagesWithID.map(message => message.userMessage as string);
        const todaysMoods = todaysMoodWithId.map(mood => mood.moodLevel);
        const messageToAi = PATIENT_CHATBOT_PROMPT + "\n\n Patient message: " + message + "\n\n Today's patient messages: " + todaysMessages + "\n\n Today's patient mood level: " + todaysMoods;
        const aiResponse = await getAiChatResponse(messageToAi);

        if(!aiResponse) throw new Error("Error fetching AI response.");

        const userMessage = new ChatBotLog({
            userId: user?._id as string,
            userMessage: message,
            botResponse: aiResponse
        });

        const savedMessages = await userMessage.save();
        if(!savedMessages) throw new Error("Could not save the message, try again"); 
        resp.status(201).json(createResponse("Message loaded successfully!", user?.role || null , "\n\n Patient message: " + message + "\n\n Today's patient messages: " + todaysMessages + "\n\n Today's patient mood level: " + todaysMoods));
    } catch (error: any) {
        console.error('Could not post message:', error);
        const response = createResponse(
            "Could not process message, try again", 
            user?.role || null, 
            null
        );
        resp.status(500).json(response);
    }
});


chatBotController.get("/chatBot/history", userAuth, async(req: AuthenticatedRequest, resp: Response) => {
    const user = req?.user;
    try {
        if(!user) {
            resp.status(404).json(createResponse("User not found", null, null));
            return;
        }

        if(user?.role != "patient") {
            resp.status(401).json(createResponse("Unauthorized request", user?.role || null, null));
            return;
        }

        const allChats = await ChatBotLog.find({userId: user?._id}, "userMessage botResponse createdAt");
        if(!allChats) {
            resp.status(404).json(createResponse("Chat not found", user?.role || null, null));
            return;
        }

        resp.status(200).json(createResponse("Messages fetched successfully!", user?.role || null, allChats));
    } catch (error: any) {
        console.error('Could not fetch messages:', error);
        const response = createResponse(
            "Could not fetch messages, try again", 
            user?.role || null, 
            null
        );
        resp.status(500).json(response);
    }
})


export default chatBotController;