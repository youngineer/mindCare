export type Role = "admin" | "patient" | "therapist";
export type Gender = "male" | "female";

export interface IUser {
    name: string;
    emailId: string;
    password: string;
    role: Role;
    contact: string;
    photoUrl: string
};

export interface Patient extends IUser{
    dateOfBirth: Date,
    gender: Gender,
    healthConditions: string[],
    emergencyContact: string
}