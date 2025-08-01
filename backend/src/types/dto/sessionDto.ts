import { SessionStatus } from "../common.js";

export interface SessionUpdateRequest {
    sessionId?: string,
    dateTime?: Date,
    duration?: number,
    status?: SessionStatus,
    notes?: string,
    rating?: number
}

export interface GetSessionsFilter {
    patientId?: string;
    therapistId?: string;
    status?: string;
    from?: Date;
    to?: Date;
    dateTime?: {
        $gte?: Date;
        $lte?: Date;
    };
}

export interface GetSessionsResponse {
    sessionId: {
        [key: string]: {  
            withUser: string;
            dateTime: Date;
            duration: number;
            status: string;
            rating: number;
        };
    };
}
