import { Schema, model } from 'mongoose';
import { mood } from '../utils/interfaces.js';
import validator from 'validator';


const moodSchema = new Schema<mood>({
    patientId: {
        type: Number,
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
});

const MoodEntry = model('MoodEntry', moodSchema);

export default MoodEntry;