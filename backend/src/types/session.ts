import { SessionStatus } from "./common.js";

export interface ISession {
    patientId: number,
    therapistId: number,
    dateTime: Date,
    duration: number,
    status: SessionStatus,
    notes: string,
    rating: number
}