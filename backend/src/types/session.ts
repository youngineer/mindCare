import { SessionStatus } from "./common.js";

export interface ISession {
    patientId: string,
    therapistId: string,
    dateTime: Date,
    duration: number,
    status: SessionStatus,
    notes: string,
    rating: number
}