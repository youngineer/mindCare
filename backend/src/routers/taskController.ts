import express, { Response } from 'express';
import { userAuth } from '../middlewares/auth.js';
import { AuthenticatedRequest } from '../types/dto/authDto.js';
import { createResponse } from '../utils/responseUtils.js';
import { ISelfCareTask, ITaskUpdateRequest } from '../types/task.js';
import SelfCareTask from '../models/SelfCareTask.js';
import { IUser } from '../types/user.js';
import User from '../models/User.js';
import { findPackageJSON } from 'module';


const taskController = express.Router();


taskController.post("/task/add", userAuth, async(req: AuthenticatedRequest, resp: Response) => {
    const user = req?.user;

    try {
        if(user?.role !== "therapist") {
            resp.status(401).json(createResponse("Only therapist can create a task for patient", user?.role || null, null));
            return;
        }

        const taskReq: ISelfCareTask = req?.body?.taskReq;
        const patientId = taskReq?.patientId;
        const therapistId = user?._id;
        const category = taskReq?.category.toLowerCase();
        const dueDate = taskReq?.dueDate;
        const priority = taskReq?.priority.toLowerCase();

        const task = new SelfCareTask({
            patientId: patientId,
            therapistId: therapistId,
            category: category,
            dueDate: dueDate,
            priority: priority
        });
        
        const patientUser = await User.findById(patientId);
        if(!patientUser) {
            resp.status(404).json(createResponse("Patient not found!", user?.role || null, null));
            return;
        }
        const patientName = patientUser?.name;
        const savedTask = await task.save();

        if(!savedTask) {
            throw new Error("Could not save task");
        }


        resp.status(201).json(createResponse("Task created successfully!", user?.role || null, {
            patientName: patientName,
            category: savedTask?.category,
            dueDate: savedTask?.dueDate,
            priority: savedTask?.priority,
            status: savedTask?.status,
            description: savedTask?.description
        }));
    } catch (error: any) {
        console.error('Task creation failed:', error);
        const response = createResponse(
            "Task creation failed", 
            user?.role || null, 
            null
        );
        resp.status(500).json(response);
    }
});


taskController.patch("/task/update", userAuth, async(req: AuthenticatedRequest, resp: Response) => {
    const user = req?.user;

    try {
        if(user?.role !== "therapist") {
            resp.status(401).json(createResponse("Only therapist can create a task for patient", user?.role || null, null));
            return;
        }

        const taskUpdateReq: ITaskUpdateRequest = req?.body?.taskUpdateReq;
        const taskId = taskUpdateReq?.taskId;
        const category = taskUpdateReq?.category.toLowerCase();
        const dueDate = taskUpdateReq?.dueDate;
        const priority = taskUpdateReq?.priority.toLowerCase();
        const status = taskUpdateReq?.status;
        const description = taskUpdateReq?.description;

        const updateData: any = {};
        if (category) updateData.category = category;
        if (dueDate) updateData.dueDate = dueDate;
        if (priority) updateData.priority = priority;
        if (status !== undefined) updateData.status = status;
        if (description) updateData.description = description;

        const updatedTask = await SelfCareTask.findByIdAndUpdate(taskId, updateData, {
            new: true,
            runValidators: true
        });

        if(!updatedTask) {
            throw new Error("Error while updating the data to db");
        }

        const patientUser = await User.findById(updatedTask?.patientId);
        if(!patientUser) {
            resp.status(404).json(createResponse("Patient not found!", user?.role || null, null));
            return;
        }
        const patientName = patientUser?.name;

        resp.status(204).json(createResponse("Task created successfully!", user?.role || null, {
            patientName: patientName,
            category: updatedTask?.category,
            dueDate: updatedTask?.dueDate,
            priority: updatedTask?.priority,
            status: updatedTask?.status,
            description: updatedTask?.description
        }));

    } catch (error: any) {
        console.error('Task updation failed:', error);
        const response = createResponse(
            "Task updation failed", 
            user?.role || null, 
            null
        );
        resp.status(500).json(response);
    }
});


taskController.get("/task/get/:toId", userAuth, async(req: AuthenticatedRequest, resp: Response) => {
    const user = req?.user;

    try {
        const toId = req?.params?.toId as string;
        const fromId = user?._id as string;
        if (!toId) {
            resp.status(400).json(createResponse("Invalid request: missing patient/therapist ID", user?.role || null, null));
            return;
        }

        const taskList = await SelfCareTask.find({
            $or: [
                { patientId: toId, therapistId: fromId },
                { patientId: fromId, therapistId: toId }
            ]
        }).exec();

        if (!taskList || taskList.length === 0) {
            resp.status(404).json(createResponse("No tasks found", user?.role || null, []));
            return;
        }

        resp.status(200).json(createResponse(
            "Tasks fetched successfully!",
            user?.role || null,
            taskList
        ));
    } catch (error: any) {
        console.error('Task fetching failed:', error);
        const response = createResponse(
            "Task fetching failed", 
            user?.role || null, 
            null
        );
        resp.status(500).json(response);
    }
})


export default taskController;