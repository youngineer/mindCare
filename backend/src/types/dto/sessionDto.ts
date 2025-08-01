import { SessionStatus } from "../common.js";

export interface SessionUpdateRequest {
    sessionId?: string,
    dateTime?: Date,
    duration?: number,
    status?: SessionStatus,
    notes?: string,
    rating?: number
}