import { Role } from "../types/common.js";
import { IResponseDto } from "../types/dto/responseDto.js";

export function createResponse<T>(message: string, role: Role | null, content: T | null): IResponseDto<T> {
  return { message, role, content };
}
