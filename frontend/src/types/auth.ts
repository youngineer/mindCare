import type { Role } from "./common";

export interface ILoginRequest {
    emailId: string;
    password: string;
};

export interface ISignupRequest extends ILoginRequest{
    name?: string;
    role?: Role;
    confirmPassword: string;
}