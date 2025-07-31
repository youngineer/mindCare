import { Gender } from "../common.js";
import { IPatient } from "../user.js";
import { AuthenticatedRequest } from "./authDto.js";

export interface IPatientDto {
    contact: string;
    photoUrl: string;
    dateOfBirth: Date;
    gender: Gender;
    healthConditions: string[];
    emergencyContact: string
};

export interface IPatientRequest extends AuthenticatedRequest{
    patientInfo?: IPatientDto;
    cookies: { [key: string]: string };
    patient?: IPatient
}