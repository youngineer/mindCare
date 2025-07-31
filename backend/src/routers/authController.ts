import express, { Request, Response, Router } from 'express';
import { validateSignUpRequest } from '../utils/validation.js';
import bcrypt from 'bcrypt';
import User from '../models/User.js';
import { IUserDocument } from '../types/user.js';
import { IResponseDto } from '../types/dto/responseDto.js';
import { createResponse } from '../utils/responseUtils.js';
import Therapist from '../models/Therapist.js';
import Patient from '../models/Patient.js';

const authController: Router = express.Router();

authController.post("/auth/signup", async (req: Request, resp: Response): Promise<void> => {
    try {
        validateSignUpRequest(req.body);

        const { name, emailId, password, role } = req.body;
        const hashedPassword: string = await bcrypt.hash(password, 10);

        const user: IUserDocument = new User({
            name,
            emailId,
            password: hashedPassword,
            role: role
        });

        const savedUser: IUserDocument = await user.save();

        if(role === 'therapist') {
            const therapist = new Therapist({
                userId: savedUser._id
            });
            await therapist.save();
        } else if(role === 'patient') {
            const patient = new Patient({
                userId: savedUser._id
            });
            await patient.save();
        }
        
        const token = savedUser.getJWT();
        resp.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000
        });

        const response: IResponseDto = {
            message: "User created successfully!",
            role: savedUser.role,
            content: {
                name: savedUser.name,
                emailId: savedUser.emailId
            }
        };

        resp.status(201).json(response);
    } catch (error: any) {
        const response: IResponseDto = {
            message: error.message || "Something went wrong",
            role: null,
            content: null
        };
        resp.status(500).json(response);
    }
});


authController.post("/auth/login", async(req: Request, resp: Response) => {
    try {
        const { emailId, password } = req.body;
        const user: IUserDocument | null = await User.findOne({ emailId });

        if (!user) {
        throw new Error("Incorrect credentials"); // email not found
        }

        const isPasswordValid = await user.validatePassword(password);
        if (!isPasswordValid) {
        throw new Error("Incorrect credentials"); // password mismatch
        }

        const token = user.getJWT();
        resp.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000
        });

        const response = createResponse("Login successful", user.role, {
            name: user.name,
            emailId: user.emailId
        });

        resp.status(200).json(response);
    } catch (error: any) {
        const response = createResponse(error.message, null, null);
        resp.status(500).json(response);
    }
});



export default authController;
