import { Schema, model } from 'mongoose';
import validator from 'validator';
import { ISession } from '../types/session.js';


const sessionSchema = new Schema<ISession>({
    patientId: {
        type: String,
        required: true
    },
    therapistId: {
        type: String,
        required: true
    },
    dateTime: {
        type: Date,
        required: true,
        validate(value: string) {
            const today = new Date();
            const inputDate = new Date(value);

            if (!validator.isDate(value)) {
                throw new Error("Invalid date");
            }
            const yesterday = new Date(today);
            yesterday.setDate(today.getDate() - 1);

            if (inputDate <= yesterday) {
                throw new Error("Date must be greater than yesterday");
            }
        }
    },
    status: {
        type: String, 
        required: true, 
        enum: ['completed', 'scheduled', 'cancelled'], 
        message: '{VALUE} is not supported',
        default: 'scheduled',
        trim: true
    },
    notes: {
        type: String,
        default: "Consultation session booked",
        trim: true,
    },
    rating: {
        type: Number,
        default: 0,
        validate(value: number) {
            if (typeof value !== 'number' || isNaN(value)) {
                throw new Error("Invalid rating");
            } else if (value < 0 || value > 5) {
                throw new Error("Min rating: 0; Max rating: 5");
            }
        }
    },
    duration: {
        type: Number,
        required: true,
        validate(value: number) {
            if (typeof value !== 'number' || isNaN(value)) {
                throw new Error("Invalid duration");
            }
        }
    }

},
{ timestamps: true });


const Session = model('Session', sessionSchema);

export default Session;