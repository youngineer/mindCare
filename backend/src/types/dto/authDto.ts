import { Request } from "express";
import { Role } from "../common.js";
import { IUserDocument } from "../user.js";
import { ISession } from "../session.js";


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
  role?: Role,
  session?: ISession
}

