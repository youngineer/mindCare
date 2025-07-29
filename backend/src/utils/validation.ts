
import validator from 'validator';
import { SignUpDto } from '../types/dto/signUpDto.js';

export function validateSignUpRequest(data: SignUpDto) {
    const { name, emailId, password, role } = data;

    if(!validator.isAlpha(name)) {
        throw new Error("Invalid name");
    } 
    if (!validator.isEmail(emailId)) {
        throw new Error("Invalid emailId");
    }
};