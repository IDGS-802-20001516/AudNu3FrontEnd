import { ENDPOINTS } from "../config/endpoints";
import Swal from 'sweetalert2';

export interface Actividad {
    idActividad?: number;
    nombreActividad: string;
    idProceso: number;
    criterio: string;
  }




export const getActividades = async (): Promise<Actividad[]> => {
  try {
    const response = await fetch(ENDPOINTS.ACTIVIDAD, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    if (!response.ok) throw new Error("Error al obtener actividades");
    return await response.json();
  } catch (error) {
    console.error("Error en getActividades:", error);
    throw error;
  }
};

export const getActividadById = async (id: number): Promise<Actividad> => {
  try {
    const response = await fetch(`${ENDPOINTS.ACTIVIDAD}/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    if (!response.ok) throw new Error("Error al obtener la actividad");
    return await response.json();
  } catch (error) {
    console.error("Error en getActividadById:", error);
    throw error;
  }
};

export const createActividad = async (actividad: Actividad): Promise<Actividad> => {
  try {
    const response = await fetch(ENDPOINTS.ACTIVIDAD, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(actividad),
    });
    console.log(actividad)
    if (!response.ok) throw new Error("Error al crear la actividad");
    Swal.fire('Éxito', 'Actividad creada correctamente', 'success');
    return await response.json();
  } catch (error) {
    console.error("Error en createActividad:", error);
    Swal.fire('Error', 'Error al crear la actividad', 'error');
    throw error;
  }
};

export const updateActividad = async (id: number, actividad: Actividad): Promise<void> => {
  try {
    const response = await fetch(`${ENDPOINTS.ACTIVIDAD}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(actividad),
    });
    if (!response.ok) throw new Error("Error al actualizar la actividad");
    Swal.fire('Éxito', 'Actividad actualizada correctamente', 'success');
  } catch (error) {
    console.error("Error en updateActividad:", error);
    Swal.fire('Error', 'Error al actualizar la actividad', 'error');
    throw error;
  }
};

export const deleteActividad = async (id: number): Promise<void> => {
  try {
    const response = await fetch(`${ENDPOINTS.ACTIVIDAD}/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    if (!response.ok) throw new Error("Error al eliminar la actividad");
    Swal.fire('Éxito', 'Actividad eliminada correctamente', 'success');
  } catch (error) {
    console.error("Error en deleteActividad:", error);
    Swal.fire('Error', 'Error al eliminar la actividad', 'error');
    throw error;
  }
};