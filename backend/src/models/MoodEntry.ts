import { Schema, model } from 'mongoose';
import validator from 'validator';
import { IMood } from '../types/mood.js';


const moodSchema = new Schema<IMood>({
    patientId: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    moodLevel: {
        type: Number,
        required: true,
        validate(value: string) {
            if(!validator.isNumeric(value) || (Number(value) < 0 || Number(value) > 10)) {
                throw new Error("Invalid mood level");
            }
        }
    },
    tags: {
        type: [String],
        required: true
    }
},
{ timestamps: true });

const MoodEntry = model('MoodEntry', moodSchema);

export default MoodEntry;