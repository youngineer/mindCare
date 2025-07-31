import express, { Response } from 'express';
import { userAuth } from '../middlewares/auth.js';
import { ITherapistDto, ITherapistRequest } from '../types/dto/therapistDto.js';
import { createResponse } from '../utils/responseUtils.js';
import User from '../models/User.js';
import Therapist from '../models/Therapist.js';
import { IPatient } from '../types/user.js';
import Patient from '../models/Patient.js';
import { Role } from '../types/common.js';
import { IPatientInfoDto } from '../types/dto/patientDto.js';

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


therapistController.get("/therapist/patient/:patientId", userAuth, async(req: ITherapistRequest, resp: Response): Promise<void> => {
    
    try {
        const patientId = req?.params?.patientId;
        const role = req?.user?.role as Role;

        if (role === "patient") {
            resp.status(403).json(createResponse("Access denied", role, null));
            return;
        }

        const patient = await Patient.findOne({ userId: patientId }).exec();
        
        if (!patient) {
            resp.status(404).json(createResponse("Patient does not exist", role, null));
            return;
        }

        const patientUser = await User.findById(patientId, "name emailId contact photoUrl").exec();
        
        if (!patientUser) {
            resp.status(404).json(createResponse("Patient user information not found", role, null));
            return;
        }

        const patientInfo: IPatientInfoDto = {
            name: patientUser.name,
            contact: patientUser.contact || "",
            photoUrl: patientUser.photoUrl || "",
            dateOfBirth: patient.dateOfBirth,
            emergencyContact: patient.emergencyContact || "",
            gender: patient.gender,
            healthConditions: patient.healthConditions || []
        };

        resp.status(200).json(createResponse("Patient info loaded successfully!", role, patientInfo));

    } catch (error: any) {
        console.error('Patient profile fetch error:', error);
        const response = createResponse(
            error.message || "Failed to retrieve patient profile", 
            req?.user?.role || null, 
            null
        );
        resp.status(500).json(response);
    }
})

export default therapistController;
