import { ENDPOINTS } from "../config/endpoints";
import Swal from "sweetalert2";

export interface Proceso {
    idProceso?: number;
    nombreProceso: string;
    estado?: boolean; // Agregamos el campo estado (puede ser opcional o no según tus necesidades)
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
    return await response.json(); // Ya solo recibirá procesos con estado = true gracias al backend
  } catch (error) {
    console.error("Error en getProcesos:", error);
    throw error;
  }
};

export const getProcesosAll = async (): Promise<Proceso[]> => {
  try {
    const response = await fetch(ENDPOINTS.PROCESOSALL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    if (!response.ok) throw new Error("Error al obtener procesos");
    return await response.json(); // Ya solo recibirá procesos con estado = true gracias al backend
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
    return await response.json(); // Solo obtendrá procesos con estado = true
  } catch (error) {
    console.error("Error en getProcesoById:", error);
    throw error;
  }
};

export const createProceso = async (proceso: Proceso): Promise<Proceso> => {
  try {
    // Aseguramos que el estado sea true al crear (aunque el backend ya lo hace)
    const procesoToCreate = { ...proceso, estado: true };
    const response = await fetch(ENDPOINTS.PROCESOS, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(procesoToCreate),
    });
    if (!response.ok) throw new Error("Error al crear el proceso");

    const createdProceso = await response.json();
    Swal.fire({
      icon: "success",
      title: "Proceso creado",
      text: "El proceso se ha creado exitosamente.",
    });
    return createdProceso;
  } catch (error) {
    console.error("Error en createProceso:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Hubo un error al crear el proceso.",
    });
    throw error;
  }
};

export const updateProceso = async (id: number, proceso: Proceso): Promise<void> => {
  try {
    // Mantenemos el estado como true al actualizar, a menos que se especifique lo contrario
    const procesoToUpdate = { ...proceso, estado: proceso.estado !== undefined ? proceso.estado : true };
    const response = await fetch(`${ENDPOINTS.PROCESOS}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(procesoToUpdate),
    });
    if (!response.ok) throw new Error("Error al actualizar el proceso");

    Swal.fire({
      icon: "success",
      title: "Proceso actualizado",
      text: "El proceso se ha actualizado exitosamente.",
    });
  } catch (error) {
    console.error("Error en updateProceso:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Hubo un error al actualizar el proceso.",
    });
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

    Swal.fire({
      icon: "success",
      title: "Proceso desactivado",
      text: "El proceso se ha desactivado exitosamente.",
    });
  } catch (error) {
    console.error("Error en deleteProceso:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Hubo un error al desactivar el proceso.",
    });
    throw error;
  }
};