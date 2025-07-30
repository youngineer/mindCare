import { Schema, model } from 'mongoose';
import dotenv from 'dotenv';
import validator from 'validator';
import { IPatient } from '../types/user.js';
dotenv.config();

const patientSchema  = new Schema<IPatient>({
    dateOfBirth: {
        type: Date,
        required: true,
        validate(value: string) {
            if(!validator.isDate(value)) {
                throw new Error("Invalid Date");
            }
        }
    },
    gender: {
        enum: {
            values: ["male", "female"],
            message: '{VALUE} is not supported'
        },
        required: true, 
        trim: true
    },
    healthConditions: {
        type: [String],
        required: true
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


const Patient = model('Patient', patientSchema);


export default Patient;