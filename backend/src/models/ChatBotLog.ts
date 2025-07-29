import { Schema, model } from 'mongoose';
import { chatBotLog } from '../utils/interfaces.js';
import validator from 'validator';

const chatBotLogSchema = new Schema<chatBotLog>({
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