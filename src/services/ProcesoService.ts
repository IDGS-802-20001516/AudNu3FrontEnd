import { ENDPOINTS } from "../config/endpoints";

export interface Proceso {
    idProceso?: number;
    nombreProceso: string;
  }

export const getProcesos = async (): Promise<Proceso[]> => {
  try {
    const response = await fetch(ENDPOINTS.PROCESOS, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    if (!response.ok) throw new Error("Error al obtener procesos");
    return await response.json();
  } catch (error) {
    console.error("Error en getProcesos:", error);
    throw error;
  }
};

export const getProcesoById = async (id: number): Promise<Proceso> => {
  try {
    const response = await fetch(`${ENDPOINTS.PROCESOS}/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    if (!response.ok) throw new Error("Error al obtener el proceso");
    return await response.json();
  } catch (error) {
    console.error("Error en getProcesoById:", error);
    throw error;
  }
};

export const createProceso = async (proceso: Proceso): Promise<Proceso> => {
  try {
    const response = await fetch(ENDPOINTS.PROCESOS, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(proceso),
    });
    if (!response.ok) throw new Error("Error al crear el proceso");
    return await response.json();
  } catch (error) {
    console.error("Error en createProceso:", error);
    throw error;
  }
};

export const updateProceso = async (id: number, proceso: Proceso): Promise<void> => {
  try {
    const response = await fetch(`${ENDPOINTS.PROCESOS}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(proceso),
    });
    if (!response.ok) throw new Error("Error al actualizar el proceso");
  } catch (error) {
    console.error("Error en updateProceso:", error);
    throw error;
  }
};

export const deleteProceso = async (id: number): Promise<void> => {
  try {
    const response = await fetch(`${ENDPOINTS.PROCESOS}/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    if (!response.ok) throw new Error("Error al eliminar el proceso");
  } catch (error) {
    console.error("Error en deleteProceso:", error);
    throw error;
  }
};