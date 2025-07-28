import { Schema, model } from 'mongoose';
import { Patient } from '../utils/interfaces.js';
import dotenv from 'dotenv';
import validator from 'validator';
dotenv.config();

const patientSchema  = new Schema<Patient>({
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
        required: true
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
        }
    }
});


const Patient = model('Patient', patientSchema);


export default Patient;