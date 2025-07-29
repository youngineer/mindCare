export type Role = "admin" | "patient" | "therapist";
export type Gender = "male" | "female";
export type SessionStatus = "scheduled" | "complete" | "cancelled";
export type PriorityList = "high" | "low";
export type TaskStatus = "pending" | "done";

export interface IUser {
    name: string;
    emailId: string;
    password: string;
    role: Role;
    contact: string;
    photoUrl: string
};

export interface patient extends IUser{
    dateOfBirth: Date,
    gender: Gender,
    healthConditions: string[],
    emergencyContact: string
}

export interface therapist extends IUser{
    rating: number,
    bio: string,
    specialties: string[],
    ratePerSession: number,
    availabilitySchedule: Date[]
}

export interface session {
    patientId: number,
    therapistId: number,
    dateTime: Date,
    duration: number,
    status: SessionStatus,
    notes: string,
    rating: number
}

export interface mood {
    patientId: number,
    date: Date,
    moodLevel: number,
    tags: string[]
}

export interface selfCareTask {
    patientId: number,
    category: string,
    description: string,
    priority: PriorityList,
    dueDate: Date,
    status: TaskStatus,
    assignedBy: number
}

export interface chatBotLog {
    userId: number,
    timestamp: Date,
    userMessage: string,
    botResponse: string
}