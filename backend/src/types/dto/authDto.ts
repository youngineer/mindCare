import { Role } from "../common.js";


export interface ILoginDto{
    emailId: string,
    password: string
}

export interface ISignUpDto extends ILoginDto {
    name: string;
    role: Role;
}

