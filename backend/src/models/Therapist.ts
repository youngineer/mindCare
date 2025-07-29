import { Schema, model } from 'mongoose';
import { therapist } from '../utils/interfaces.js';
import dotenv from 'dotenv';
import validator from 'validator';
dotenv.config();


const therapistSchema = new Schema<therapist>({
    specialties: {
        type: [String],
        required: true,
        validate(value: string) {
            if(!validator.isAlphanumeric(value)) {
                throw new Error("Invalid speciality");
            }
        }
    },
    bio: {
        type: String,
        default: "Your doctor! Here to help",
        validate(value: string) {
            if(!validator.isAlphanumeric(value)) {
                throw new Error("Invalid speciality");
            }
        }, 
        trim: true
    },
    rating: {
        type: Number,
        validate(value: string) {
            if(!validator.isNumeric(value)) {
                throw new Error("Invalid rating");
            } else if (Number(value) > 5 || Number(value) < 0) {
                throw new Error("Min rating: 0; Max rating: 5");
            }
        }, 
        trim: true
    },
    availabilitySchedule: {
        type: [Date],
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
    ratePerSession: {
        type: Number,
        validate(value: string) {
            if(!validator.isNumeric(value) || Number(value) < 0) {
                throw new Error("Invalid rate");
            }
        },
        required: true, 
        trim: true
    }
});


const Therapist = model('Therapist', therapistSchema);

export default Therapist;