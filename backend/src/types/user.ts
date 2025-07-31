import { Gender, Role } from "./common.js";
import { Document } from "mongoose";

export interface IUser {
    name: string;
    emailId: string;
    password: string;
    role: Role;
    contact?: string;
    photoUrl?: string
};

export interface IPatient extends IUser{
    userId: string;
    dateOfBirth: Date,
    gender: Gender,
    healthConditions: string[],
    emergencyContact: string
}

export interface ITherapist extends IUser{
    userId: string;
    rating: number,
    bio: string,
    specialties: string[],
    ratePerSession: number,
    availabilitySchedule: Date[]
}


export interface IUserDocument extends IUser, Document {
  getJWT(): string;
  validatePassword(password: string): Promise<boolean>;
}





