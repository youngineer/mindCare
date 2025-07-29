import { Schema, model } from 'mongoose';
import { IChatBotLog } from '../types/chatBotLog.js';

const chatBotLogSchema = new Schema<IChatBotLog>({
    userId: {
        type: Number,
        required: true,
    },
    timestamp: {
        type: Date,
        required: true
    },
    userMessage: {
        type: String,
        required: true,
        trim: true
    },
    botResponse: {
        type: String,
        required: true,
        trim: true
    }
});

const ChatBotLog = model('ChatBotLog', chatBotLogSchema);
export default ChatBotLog;