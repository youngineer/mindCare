import express, { Response } from 'express';
import { userAuth } from '../middlewares/auth.js';
import { ITherapistDto, ITherapistRequest } from '../types/dto/therapistDto.js';
import { createResponse } from '../utils/responseUtils.js';
import User from '../models/User.js';
import Therapist from '../models/Therapist.js';

const therapistController = express.Router();

therapistController.patch("/therapist/updateInfo", userAuth, async (req: ITherapistRequest, resp: Response): Promise<void> => {
    let updatedUser = null;
    try {
        const userId = req?.user?._id;
        const therapistInfo: ITherapistDto = req?.body?.therapistInfo;

        if (!therapistInfo) {
            resp.status(400).json(createResponse("Therapist info is required.", null, null));
            return;
        }

        // Update User info (contact, photoUrl)
        if (therapistInfo?.contact || therapistInfo?.photoUrl) {
            updatedUser = await User.findOneAndUpdate({ _id: userId }, {
                contact: therapistInfo?.contact,
                photoUrl: therapistInfo?.photoUrl
            }, { new: true });
        }

        // Update the therapist field
        const therapist = await Therapist.findOneAndUpdate({userId: userId},{
            specialties: therapistInfo?.specialties,
            availabilitySchedule: therapistInfo?.availabilitySchedule,
            bio: therapistInfo?.bio,
            ratePerSession: therapistInfo?.ratePerSession
        });

        // Ensure updatedUser is available
        if (!updatedUser) {
            resp.status(500).json(createResponse("User information update failed.", null, null));
            return;
        }

        // Return success response with updated user details
        resp.status(201).json(createResponse(
            "Information stored successfully!",
            updatedUser.role || null,
            {
                name: updatedUser.name,
                emailId: updatedUser.emailId
            }
        ));
    } catch (error: any) {
        const response = createResponse(error.message, null, null);
        resp.status(500).json(response);
    }
});

export default therapistController;
