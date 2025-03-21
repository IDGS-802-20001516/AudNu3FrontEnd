import { ENDPOINTS } from "../config/endpoints";

export interface Actividad {
  idActividad: number;
  nombreActividad: string;
}

export const getActividades = async (): Promise<Actividad[]> => {
  const response = await fetch(ENDPOINTS.ACTIVIDAD); // Asegúrate de definir este endpoint en endpoints.ts
  if (!response.ok) {
    throw new Error('Error al obtener los roles');
  }
  return response.json();
};