import { PriorityList, TaskStatus } from "./common.js";

export interface ISelfCareTask {
    patientId: string,
    therapistId?: string,
    category: string,
    description?: string,
    priority: PriorityList,
    dueDate: Date,
    status?: TaskStatus
}

export interface ITaskUpdateRequest extends ISelfCareTask {
    taskId: string
}