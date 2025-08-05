import express, { Response } from 'express';
import { userAuth } from '../middlewares/auth.js';
import { AuthenticatedRequest } from '../types/dto/authDto.js';
import { createResponse } from '../utils/responseUtils.js';
import { PATIENT_CHATBOT_PROMPT } from '../utils/constants.js';
import { getAiChatResponse } from '../utils/aiResponse.js';
import ChatBotLog from '../models/ChatBotLog.js';

const chatBotController = express.Router();


chatBotController.post("/chatBot/add", userAuth, async(req: AuthenticatedRequest, resp: Response) => {
    const user = req?.user;

    try {
        const message = req?.body?.patientMessage as string;
        if(!message) {
            resp.status(400).json(createResponse("Invalid request: missing message", user?.role || null, null));
            return;
        }

        const messageToAi = PATIENT_CHATBOT_PROMPT + "\n Patient message: " + message;
        const aiResponse = await getAiChatResponse(messageToAi);

        if(!aiResponse) throw new Error("Error fetching AI response.");

        const userMessage = new ChatBotLog({
            userId: user?._id as string,
            userMessage: message,
            botResponse: aiResponse
        });

        const savedMessages = await userMessage.save();
        if(!savedMessages) throw new Error("Could not save the message, try again"); 
        resp.status(201).json(createResponse("Message loaded successfully!", user?.role || null , savedMessages));
    } catch (error: any) {
        console.error('Could not post message:', error);
        const response = createResponse(
            "Could not process message, try again", 
            user?.role || null, 
            null
        );
        resp.status(500).json(response);
    }
})


export default chatBotController;