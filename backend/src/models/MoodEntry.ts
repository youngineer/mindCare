import { Schema, model } from 'mongoose';
import { IMood } from '../types/mood.js';
import User from './User.js';


const moodSchema = new Schema<IMood>({
    patientId: {
        type: String,
        required: true,
        ref: User,
    },
    dateTime: {
        type: Date,
        default: new Date()
    },
    moodLevel: {
        type: Number,
        required: true,
        validate(value: number) {
            if(value < 1 || value > 10) {
                throw new Error("Invalid mood level");
            }
        }
    },
    tags: {
        type: [String]
    }
},
{ timestamps: true });

const MoodEntry = model('MoodEntry', moodSchema);

export default MoodEntry;