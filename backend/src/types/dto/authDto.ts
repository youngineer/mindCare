import { CookieOptions } from "express";
import { Role } from "../common.js";
import { IUserDocument } from "../user.js";


export interface ILoginDto{
    emailId: string,
    password: string
}

export interface ISignUpDto extends ILoginDto {
    name: string;
    role: Role;
}

export interface AuthenticatedRequest extends Request {
  user?: IUserDocument;
  cookies: { [key: string]: string };
}

