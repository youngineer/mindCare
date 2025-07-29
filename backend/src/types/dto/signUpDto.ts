import { Role } from "../common.js";

export interface SignUpDto {
    name: string;
    emailId: string;
    password: string;
    role: Role;
}
