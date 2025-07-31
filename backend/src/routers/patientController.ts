import express, { Response } from 'express';
import { userAuth } from '../middlewares/auth.js';
import { IPatientDto, IPatientRequest } from '../types/dto/patientDto.js';
import { createResponse } from '../utils/responseUtils.js';
import User from '../models/User.js';
import Patient from '../models/Patient.js';
import Therapist from '../models/Therapist.js';


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



patientController.get("/patient/therapists", userAuth, async(req: IPatientRequest, resp: Response): Promise<void> => {
    try {
        const role = req?.user?.role;
        
        if(role === "therapist") {
            resp.status(403).json(createResponse("Access denied for therapist role", null, null));
            return;
        }
        
        // Fetch therapist users with required fields
        const userTherapists = await User.find(
            { role: "therapist" }, 
            "_id name photoUrl"
        ).exec();

        if (userTherapists.length === 0) {
            resp.status(200).json(createResponse("No therapists available", req?.user?.role || null, {}));
            return;
        }

        // Collect all userIds for therapist collection query
        const userIds = userTherapists.map(currTherapist => currTherapist._id);

        // Query therapist collection for professional details
        const therapists = await Therapist.find(
            { userId: { $in: userIds } }, 
            "userId rating ratePerSession"
        ).exec();

        // Create map for therapist data
        const therapistDataMap = new Map();
        therapists.forEach(therapist => {
            therapistDataMap.set(therapist.userId.toString(), {
                rating: therapist.rating,
                ratePerSession: therapist.ratePerSession
            });
        });

        // Build the final mapped response
        const therapistList: { [key: string]: any } = {};
        
        userTherapists.forEach(user => {
            const { _id, name, photoUrl } = user as { _id: any; name: string; photoUrl: string };
            const userId: string = _id.toString();
            const therapistData = therapistDataMap.get(userId);
            
            therapistList[userId] = {
                name,
                photoUrl,
                ratePerSession: therapistData?.ratePerSession || 0,
                rating: therapistData?.rating || 0
            };
        });

        resp.status(200).json(createResponse(
            "Therapist list fetched successfully", 
            req?.user?.role || null, 
            therapistList
        ));
    } catch (error: any) {
        console.error('Therapist list fetch error:', error);
        const response = createResponse(
            error.message || "Failed to fetch therapist list", 
            null, 
            null
        );
        resp.status(500).json(response);
    }
})



export default patientController;