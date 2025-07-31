import express, { Response } from 'express';
import { userAuth } from '../middlewares/auth.js';
import { IPatientDto, IPatientRequest } from '../types/dto/patientDto.js';
import { createResponse } from '../utils/responseUtils.js';
import User from '../models/User.js';
import Patient from '../models/Patient.js';


const patientController = express.Router();

patientController.patch("/patient/updateInfo", userAuth, async(req: IPatientRequest, resp: Response) => {
    let updatedUser = null;
    try {
        const userId = req?.user?._id;
        const patientInfo: IPatientDto = req?.body?.patientInfo;

        if (!patientInfo) {
            resp.status(400).json(createResponse("Patient info is required.", null, null));
            return;
        }

        if(patientInfo?.contact || patientInfo?.photoUrl) {
            const userUpdateInfo = {
                contact: patientInfo?.contact,
                photoUrl: patientInfo?.photoUrl
            };

            updatedUser = await User.findOneAndUpdate({ _id: userId }, userUpdateInfo, { new: true });
        };

        await Patient.findOneAndUpdate({userId: userId}, {
            dateOfBirth: patientInfo?.dateOfBirth,
            gender:patientInfo?.gender,
            healthConditions: patientInfo?.healthConditions,
            emergencyContact: patientInfo?.emergencyContact
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

export default patientController;