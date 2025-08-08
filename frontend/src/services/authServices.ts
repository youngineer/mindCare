import type { ILoginRequest, ISignupRequest } from "../types/auth";
import type { IResponseDto } from "../types/common";
import { BASE_URL } from "../utils/constants";
import { createResponseDto } from "../utils/helperFunctions";

const AUTH_URL = BASE_URL + "/auth";

export async function logout(): Promise<IResponseDto> {
    console.log("logout requested");
    try {
        const url = AUTH_URL + "/logout";
        const request = new Request(url, {
            method: "POST",
            credentials: "include"
        })
        const response = await fetch(request);
        if(!response.ok) {
            throw new Error("Error logging out");
        }
        console.log(response.body);

        return createResponseDto("Logout successful!", null, false)
    } catch (error: any) {
        console.error(error);
        return createResponseDto(error.message, null, false);
    }
};


export async function login(loginPayload: ILoginRequest): Promise<IResponseDto> {
    console.log("login requested", loginPayload);
    try {
        const url = AUTH_URL + "/login";
        const request = new Request(url, {
            method: "POST",
            body: JSON.stringify(loginPayload),
            credentials: "include"
        })
        const response = await fetch(request);
        if(!response.ok) {
            throw new Error("Error logging in");
        }
        console.log(response.body);

        return createResponseDto("Login successful!", null, false)
    } catch (error: any) {
        console.error(error);
        return createResponseDto(error.message, null, false);
    }
}


export async function signup(signupPayload: ISignupRequest): Promise<IResponseDto> {
    console.log("signup requested", signupPayload);
    try {
        const url = AUTH_URL + "/signup";
        const request = new Request(url, {
            method: "POST",
            body: JSON.stringify(signupPayload),
            credentials: "include"
        })
        const response = await fetch(request);
        if(!response.ok) {
            throw new Error("Error logging in");
        }
        console.log(response.body);

        return createResponseDto("Signup successful!", null, false)
    } catch (error: any) {
        console.error(error);
        return createResponseDto(error.message, null, false);
    }
}