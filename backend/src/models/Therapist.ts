import { Schema, model } from 'mongoose';
import dotenv from 'dotenv';
import validator from 'validator';
import { ITherapist } from '../types/user.js';
dotenv.config();


const therapistSchema = new Schema<ITherapist>({
    userId: {
        type: String,
        required: true,
        unique: true
    },
    specialties: {
        type: [String]
    },
    bio: {
        type: String,
        default: "Your doctor! Here to help",
        trim: true,
        maxLength: 500
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
        validate(value: number) {
            if (value < 0 || value > 5) {
                throw new Error("Rating must be between 0 and 5");
            }
        }
    },
    availabilitySchedule: {
        type: [Date],
        validate(value: [Date]) {
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(today.getDate() - 1);

            // Check each date in the array
            for (let i = 0; i < value.length; i++) {
            const inputDate = new Date(value[i]);

            // Check if the value is a valid date
            if (isNaN(inputDate.getTime())) {
                throw new Error("Invalid date");
            }

            // Check if the date is greater than yesterday
            if (inputDate <= yesterday) {
                throw new Error("Date must be greater than yesterday");
            }
            }
        }
    },
    ratePerSession: {
        type: String,
        validate(value: string) {
            if(!validator.isNumeric(value) || Number(value) < 0) {
                throw new Error("Invalid rate");
            }
        }, 
        trim: true
    },
},
{ timestamps: true });

therapistSchema.index({ userId: 1 }, { unique: true, name: 'idx_therapist_userId' });

const Therapist = model<ITherapist>('Therapist', therapistSchema);

export default Therapist;