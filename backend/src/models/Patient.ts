import { Schema, model } from 'mongoose';
import dotenv from 'dotenv';
import validator from 'validator';
import { IPatient } from '../types/user.js';
import User from './User.js';
dotenv.config();

const patientSchema  = new Schema<IPatient>({
    userId: {
        type: String,
        ref: User,
        required: true,
        unique: true
    },
    dateOfBirth: {
        type: Date,
        validate(value: string) {
            if(!validator.isDate(value)) {
                throw new Error("Invalid Date");
            }
        }
    },
    gender: {
        type: String,
        enum: ["male", "female"],
        message: '{VALUE} is not supported',
        trim: true
    },
    healthConditions: {
        type: [String],
    },
    emergencyContact: {
        type: String,
        validate(value: string) {
            if(!validator.isMobilePhone(value)) {
                throw new Error("Invalid phone number");
            }
        }, 
        trim: true
    }
},
{ timestamps: true });

patientSchema.index({ userId: 1 }, { unique: true, name: 'idx_patient_userId' });


const Patient = model<IPatient>('Patient', patientSchema);


export default Patient;