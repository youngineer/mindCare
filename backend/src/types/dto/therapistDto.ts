import { ITherapist } from "../user.js";
import { AuthenticatedRequest } from "./authDto.js";

export interface ITherapistDto {
    contact: string;
    photoUrl: string;
    specialties: string[],
    bio: string,
    availabilitySchedule: Date[],
    ratePerSession: number
};


export interface ITherapistRequest extends AuthenticatedRequest{
    therapistInfo?: ITherapistDto;
    cookies: { [key: string]: string };
    therapist?: ITherapist
}