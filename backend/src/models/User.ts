import { Schema, model } from 'mongoose';

import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import validator from 'validator';
import { DEFAULT_PHOTO_URL } from '../utils/constants.js';
import { IUserDocument } from '../types/user.js';
dotenv.config();


const userSchema = new Schema<IUserDocument>({
    name: {
        type: String, 
        required: true,
        validate(value: string) {
            if(!validator.isAlpha(value)) {
                throw new Error("Invalid name");
            }
        }
    },
    emailId: {
        type: String, 
        required: true,
        validate(value: string) {
            if(!validator.isEmail(value)) {
                throw new Error("Invalid mail id");
            }
        }
    },
    password: {
        type: String, 
        required: true
    },
    role: {
        type: String, 
        required: true, 
        enum: { 
            values: ['therapist', 'admin', 'patient'], 
            message: '{VALUE} is not supported' 
        }
    },
    contact: {
        type: String,
        required: true,
        validate(value: string) {
            if(!validator.isMobilePhone(value)) {
                throw new Error("Invalid phone number");
            }
        }
    },
    photoUrl: {
        type: String,
        default: DEFAULT_PHOTO_URL,
        validate(value: string) {
            if(!validator.isURL(value)) {
                throw new Error("Invalid image url");
            }
        }
    }
    },
    { timestamps: true }
);


userSchema.methods.getJWT = function(): string {
    const user = this;
    const secret: string = process.env.JWT_SECRET ?? '';
    const token: string = jwt.sign({ _id: user._id }, secret);
    return token;
};

userSchema.methods.validatePassword = async function(password: string):Promise<boolean> {
    const user = this;
    const passwordHash: string = user.password;
    return bcrypt.compare(password, passwordHash);
};

const User = model<IUserDocument>('User', userSchema);

export default User;
