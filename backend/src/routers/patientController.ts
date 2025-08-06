import express, { Response } from 'express';
import { userAuth } from '../middlewares/auth.js';
import { IPatientDto, IPatientRequest } from '../types/dto/patientDto.js';
import { createResponse } from '../utils/responseUtils.js';
import User from '../models/User.js';
import Patient from '../models/Patient.js';
import Therapist from '../models/Therapist.js';
import { ITherapistInfoDto, ITherapistRequest } from '../types/dto/therapistDto.js';
import { Role } from '../types/common.js';
import { AuthenticatedRequest } from '../types/dto/authDto.js';
import { generatePatientReports, generateSummary } from '../utils/cronScheduler.js';
import DailySummaryReport from '../models/PatientAnalysis.js';
import { IDailySummaryReportDto } from '../types/dailyPatientSummary.js';


const patientController = express.Router();

patientController.patch("/patient/updateInfo", userAuth, async(req: IPatientRequest, resp: Response) => {
    let updatedUser = null;
    const user = req?.user;
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
            resp.status(500).json(createResponse("User information update failed.", user?.role || null, null));
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
        const response = createResponse(error.message, user?.role || null, null);
        resp.status(500).json(response);
    }
});



patientController.get("/patient/therapistList", userAuth, async(req: IPatientRequest, resp: Response): Promise<void> => {
    const user = req?.user;
    try {
        const role = req?.user?.role;
        let filtersRaw = req?.query?.filter;
        let filters: string[] = [];

        if (typeof filtersRaw === 'string') {
            filters = [filtersRaw];
        } else if (Array.isArray(filtersRaw)) {
            filters = filtersRaw.map(String);
        } else {
            filters = []; 
        }
        
        if(role === "therapist") {
            resp.status(403).json(createResponse("Access denied for therapist role", user?.role || null, null));
            return;
        }

        // Query therapist collection for professional details
        let therapists = null;
        if(filters.length !== 0) {
            therapists = await Therapist.find(
                { specialties: {$in: filters} }, 
                "userId rating ratePerSession"
            ).exec();
        } else {
            therapists = await Therapist.find(
                {}, 
                "userId rating ratePerSession"
            ).exec();
        }

        const userIds = therapists.map(t => t.userId);

        const userTherapists = await User.find(
            { _id: { $in: userIds } },
            "_id name photoUrl"
            ).exec();

        if (userTherapists.length === 0) {
            resp.status(200).json(createResponse("No therapists available", user?.role || null, {}));
            return;
        }


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
            user?.role || null, 
            therapistList
        ));
    } catch (error: any) {
        console.error('Therapist list fetch error:', error);
        const response = createResponse(
            error.message || "Failed to fetch therapist list", 
            user?.role || null, 
            null
        );
        resp.status(500).json(response);
    }
});


patientController.get("/patient/therapist/:therapistId", userAuth, async(req: ITherapistRequest, resp: Response) => {
    const user = req?.user;
    try {
        const therapistId = req?.params?.therapistId;
        const role = req?.user?.role as Role;

        if(role === "therapist") {
            resp.status(403).json(createResponse("Access denied", role, null));
            return;
        }

        const therapist = await Therapist.findOne({ userId: therapistId }).exec();
        if (!therapist) {
            resp.status(404).json(createResponse("Therapist does not exist", role, null));
            return;
        }

        const therapistUser = await User.findById(therapistId, "name photoUrl emailId contact");
        if (!therapistUser) {
            resp.status(404).json(createResponse("Therapist user information not found", role, null));
            return;
        }

        const therapistInfo: ITherapistInfoDto = {
            name: therapistUser?.name,
            emailId: therapistUser?.emailId,
            bio: therapist?.bio,
            photoUrl: therapistUser?.photoUrl || "",
            ratePerSession: therapist?.ratePerSession,
            rating: therapist?.rating,
            availabilitySchedule: therapist?.availabilitySchedule,
            specialties: therapist?.specialties,
            contact: therapistUser?.contact || ""
        };

        resp.status(200).json(createResponse("Therapist fetched successfully!", role, therapistInfo));

    } catch (error: any) {
        console.error('Therapist info fetch error:', error);
        const response = createResponse(
            error.message || "Failed to fetch therapist info", 
            user?.role || null, 
            null
        );
        resp.status(500).json(response);
    }
});


patientController.post("/patient/generateSummary", userAuth, async(req: AuthenticatedRequest, resp: Response) => {
    const user = req?.user;
    try {
        const userId = user?._id as string;
        if(user?.role === "admin") {
            resp.status(401).json(createResponse("Unauthorized access", user?.role || null, null));
            return;
        }

        const patientSummary = await generateSummary(userId);
        const summary = new DailySummaryReport({
            patientId: userId,
            moodSnapshot: patientSummary?.moodSnapshot,
            conversationSummary: patientSummary?.conversationSummary,
            progressUpdate: patientSummary?.progressUpdate,
            dailyRecommendations: patientSummary?.dailyRecommendations,
            overallSummary: patientSummary?.overallSummary
        });

        const savedSummary = await summary.save();
        if(!savedSummary) throw new Error("Error saving the report");

        resp.status(201).json(createResponse("Summary generated successfully!", user?.role || null, null));


    } catch (error: any) {
        console.error('Therapist summary generation error:', error);
        const response = createResponse(
            error.message || "Failed to  generate therapist summary", 
            user?.role || null, 
            null
        );
        resp.status(500).json(response);
    }
});


patientController.get("/patient/getReport", userAuth, async(req: AuthenticatedRequest, resp: Response) => {
    const user = req?.user;
    try {
        // fetch last document generated
        let summaryDto = null;
        const summary = await DailySummaryReport.find({patientId: user!._id}).sort({_id: -1}).limit(1);
        if (summary && summary.length > 0) {
            const lastSummary = summary[0];
            summaryDto = {
                moodSnapshot: lastSummary.moodSnapshot,
                conversationSummary: lastSummary.conversationSummary,
                progressUpdate: lastSummary.progressUpdate,
                dailyRecommendations: lastSummary.dailyRecommendations,
                overallSummary: lastSummary.overallSummary,
                createdAt: lastSummary.createdAt
            };
        }

        resp.status(200).json(createResponse("Summary fetched successfully", user?.role || null, summaryDto));
    } catch (error: any) {
        console.error('Therapist summary generation error:', error);
        const response = createResponse(
            error.message || "Failed to  generate therapist summary", 
            user?.role || null, 
            null
        );
        resp.status(500).json(response);
    }
})

export default patientController;