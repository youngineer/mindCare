import { Schema, model } from 'mongoose';
import validator from 'validator';
import { ISession } from '../types/session.js';


const sessionSchema = new Schema<ISession>({
    patientId: {
        type: Number,
        required: true
    },
    therapistId: {
        type: Number,
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
        enum: { 
            values: ['completed', 'scheduled', 'cancelled'], 
            message: '{VALUE} is not supported' 
        },
        trim: true
    },
    notes: {
        type: String,
        trim: true,
        validate(value: string) {
            if(!validator.isAlphanumeric(value)) {
                throw new Error("Only alphanumerics allowed");
            }
        }
    },
    rating: {
        type: Number,
        validate(value: string) {
            if(!validator.isNumeric(value)) {
                throw new Error("Invalid rating")
            } else if (Number(value) > 5 || Number(value) < 0) {
                throw new Error("Min rating: 0; Max rating: 5");
            }
        }
    },
    duration: {
        type: Number,
        validate(value: string) {
            if(!validator.isNumeric(value)) {
                throw new Error("Invalid rating")
            }
        }
    }
});


const Session = model('Session', sessionSchema);

export default Session;