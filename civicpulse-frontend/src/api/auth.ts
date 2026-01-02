//Centrailzed functions for authentication 
import { api } from "./client";
import type { SigninRequest, SignupRequest, AuthResponse } from "../types/auth";

// Signin function
export async function signin(payload: SigninRequest): Promise<AuthResponse> {
  try {
    const { data } = await api.post<AuthResponse>("/auth/signin", payload);
    return data;
  } catch (err: any) {
    // Check if the server sent a specific error message
    if (err.response && err.response.data && err.response.data.message) {
      throw new Error(err.response.data.message);
    }
    // Otherwise, throw your own custom message
    throw new Error("Internal Server Error");
  }
}

// Signup function
export async function signup(payload: SignupRequest): Promise<AuthResponse> {
  try {
    const { data } = await api.post<AuthResponse>("/auth/signup", payload);
    return data;
  } catch (err: any) {
    // Check if the server sent a specific error message
    if (err.response && err.response.data && err.response.data.message) {
      throw new Error(err.response.data.message);
    }
      throw new Error("Internal Server Error");
  }
}

// --- NEW OTP FUNCTIONS (Fixed to use 'api' client) ---

// Update this function in your api/auth.ts
export async function sendOtp(email: string, type: 'SIGNUP' | 'RESET'): Promise<{ message: string }> {
  try {
    // Send both email AND type to the backend
    const { data } = await api.post("/auth/send-otp", { email, type });
    return data;
  } catch (err: any) {
    if (err.response && err.response.data && err.response.data.message) {
      throw new Error(err.response.data.message);
    }
    throw new Error("Failed to send OTP.");
  }
}

export async function verifyOtpBackend(email: string, otp: string): Promise<{ message: string }> {
  try {
    const { data } = await api.post("/auth/verify-otp", { email, otp });
    return data;
  } catch (err: any) {
    if (err.response && err.response.data && err.response.data.message) {
      throw new Error(err.response.data.message);
    }
    throw new Error("Invalid OTP or verification failed.");
  }
}


export const resetPassword = async (payload: { email: string, newPassword: string }) => {
  try {
    // Correct Axios syntax: api.post(url, data)
    const { data } = await api.post("/auth/reset-password", payload);
    return data;
  } catch (err: any) {
    // Consistent error handling
    if (err.response && err.response.data && err.response.data.message) {
      throw new Error(err.response.data.message);
    }
    throw new Error("Failed to reset password.");
  }
};