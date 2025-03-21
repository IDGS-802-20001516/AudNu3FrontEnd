import { ENDPOINTS } from "../config/endpoints";

export interface Rol {
  idRol: number;
  nombreRol: string;
}

export const getRoles = async (): Promise<Rol[]> => {
  const response = await fetch(ENDPOINTS.ROLES); // Asegúrate de definir este endpoint en endpoints.ts
  if (!response.ok) {
    throw new Error('Error al obtener los roles');
  }
  return response.json();
};