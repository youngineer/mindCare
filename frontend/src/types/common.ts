export type Role = "admin" | "patient" | "therapist" | null;


export interface IResponseDto {
    message: string | "";
    role: Role | "";
    content: Object | null
}

export interface IAlertProps {
    message: string;
    isSuccess: boolean
}