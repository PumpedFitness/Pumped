/* tslint:disable */
/* eslint-disable */
// Generated using typescript-generator version 4.0.0 on 2026-04-27 15:57:33.

export interface UpdateMeRequest {
    username: string;
    description: string;
    profilePictureUrl: string;
}

export interface UserLoginRequest {
    username: string;
    password: string;
}

export interface UserRegisterRequest {
    username: string;
    password: string;
}

export interface UserSessionRefreshRequest {
    username: string;
}

export interface GetMeResponse {
    username: string;
    description: string;
    profilePicture: string;
    updatedAt: number;
}

export interface UserLoginResponse {
    token: string;
}

export interface UserRegisterResponse {
    username: string;
    createdAt: number;
    updatedAt: number;
}
