import { PriorityList, TaskStatus } from "./common.js";

export interface ISelfCareTask {
    patientId: string,
    category: string,
    description: string,
    priority: PriorityList,
    dueDate: Date,
    status: TaskStatus,
    assignedBy: number
}