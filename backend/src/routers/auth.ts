import express, { Request, Response, Router } from 'express';
import { validateSignUpRequest } from '../utils/validation.js';
import bcrypt from 'bcrypt';
import User from '../models/User.js';
import { IUserDocument } from '../types/user.js';
import { IResponseDto } from '../types/dto/responseDto.js';

const authRouter: Router = express.Router();

authRouter.post("/auth/signup", async (req: Request, resp: Response): Promise<void> => {
    try {
        validateSignUpRequest(req.body);

        const { name, emailId, password } = req.body;
        const hashedPassword: string = await bcrypt.hash(password, 10);

        const user: IUserDocument = new User({
            name,
            emailId,
            password: hashedPassword
        });

        const savedUser: IUserDocument = await user.save();
        const token = savedUser.getJWT();
        resp.cookie("token", token);

        const response: IResponseDto = {
            message: "User created successfully!",
            content: {
                name: savedUser.name,
                emailId: savedUser.emailId,
                role: savedUser.role
            }
        };

        resp.status(201).json(response);
    } catch (error: any) {
        const response: IResponseDto = {
            message: error.message || "Something went wrong",
            content: null
        };
        resp.status(500).json(response);
    }
});


authRouter.post("/auth/login", async(req: Request, resp: Response) => {
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
        resp.cookie("token", token);

        const response: IResponseDto = {
            message: "Login successful!",
            content: {
                name: user.name,
                emailId: user.emailId,
                role: user.role
            }
        };

        resp.status(200).json(response);
    } catch (error: any) {
        const response: IResponseDto = {
            message: error.message || "Something went wrong",
            content: null
        };
        resp.status(500).json(response);
    }
});



export default authRouter;
