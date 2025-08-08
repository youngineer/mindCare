import type { IResponseDto, Role } from "../types/common";

export function createResponseDto(message: string, role: Role, content: Object ):IResponseDto {
    return {
        message: message,
        role: role,
        content: content
    }
}