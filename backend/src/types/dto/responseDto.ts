import { Role } from "../common.js"

export interface IResponseDto<T = object> {
  message: string;
  role?: Role | null;
  content: T | null;
}

