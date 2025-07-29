
import validator from 'validator';
import { ISignUpDto } from '../types/dto/authDto.js';

export function validateSignUpRequest(data: ISignUpDto) {
    const { name, emailId, password, role } = data;

    if(!validator.isAlpha(name)) {
        throw new Error("Invalid name");
    } 
    if (!validator.isEmail(emailId)) {
        throw new Error("Invalid emailId");
    }
};