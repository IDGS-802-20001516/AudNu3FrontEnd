// src/services/authService.ts
import { ENDPOINTS } from "../config/endpoints";

export interface LoginRequest {
    username: string;
    password: string;
  }
  
  export interface LoginResponse {
    token: string;
  }
  
export const loginUser = async (username: string, password: string) => {
  const response = await fetch(ENDPOINTS.LOGIN, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) throw new Error("Credenciales incorrectas");

  return await response.json();
};

  