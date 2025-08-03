import express, { Response } from 'express';
import { userAuth } from '../middlewares/auth.js';
import { AuthenticatedRequest } from '../types/dto/authDto.js';
import { createResponse } from '../utils/responseUtils.js';
import { PATIENT_CHATBOT_PROMPT } from '../utils/constants.js';
import { getAiResponse } from '../utils/aiResponse.js';

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
        const aiResponse = await getAiResponse(messageToAi);

        if(!aiResponse) throw new Error("Error fetching AI response.");
        resp.status(201).json(createResponse("Message loaded successfully!", user?.role || null ,aiResponse));
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