import { ITherapist } from "../user.js";
import { AuthenticatedRequest } from "./authDto.js";

export interface ITherapistDto {
    contact: string;
    photoUrl: string;
    specialties: string[],
    bio: string,
    availabilitySchedule: Date[],
    ratePerSession: string
};


export interface ITherapistRequest extends AuthenticatedRequest{
    therapistInfo?: ITherapistDto;
    cookies: { [key: string]: string };
    therapist?: ITherapist
}


export interface ITherapistInfoDto extends ITherapistDto {
    name: string;
    emailId: string;
    rating: number;
}

