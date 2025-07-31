
import validator from 'validator';
import { ISignUpDto } from '../types/dto/authDto.js';

export function validateSignUpRequest(data: ISignUpDto) {
    const { name, emailId, password, role } = data;

    if(!validator.isAlpha(name, 'en-US', { ignore: ' ' })) {
        throw new Error("Invalid name - only letters and spaces allowed");
    } 
    if (!validator.isEmail(emailId)) {
        throw new Error("Invalid emailId");
    }
    if (!password || password.length < 8) {
        throw new Error("Password must be at least 8 characters long");
    }
    if (!validator.isStrongPassword(password, { 
        minLength: 8, 
        minLowercase: 1, 
        minUppercase: 1, 
        minNumbers: 1, 
        minSymbols: 1 
    })) {
        throw new Error("Password must contain uppercase, lowercase, number, and special character");
    }
    if (!['admin', 'patient', 'therapist'].includes(role)) {
        throw new Error("Invalid role");
    }
};