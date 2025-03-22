import { ENDPOINTS } from "../config/endpoints";
import Swal from 'sweetalert2';

export interface Actividad {
  idActividad?: number;
  nombreActividad: string;
  idProceso: number;
  criterio: string;
}

// Función para obtener los headers comunes
const getHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

// Función para manejar errores y mostrar alertas
const handleError = (error: unknown, message: string) => {
  console.error(message, error);
  Swal.fire('Error', message, 'error');
  throw error;
};

// Función para mostrar alertas de éxito
const showSuccessAlert = (message: string) => {
  Swal.fire('Éxito', message, 'success');
};

// Obtener todas las actividades
export const getActividades = async (): Promise<Actividad[]> => {
  try {
    const response = await fetch(ENDPOINTS.ACTIVIDAD, {
      method: "GET",
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
    return await response.json();
  } catch (error) {
    return handleError(error, "Error al obtener actividades");
  }
};

// Obtener una actividad por ID
export const getActividadById = async (id: number): Promise<Actividad> => {
  try {
    const response = await fetch(`${ENDPOINTS.ACTIVIDAD}/${id}`, {
      method: "GET",
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
    return await response.json();
  } catch (error) {
    return handleError(error, "Error al obtener la actividad");
  }
};

// Crear una nueva actividad
export const createActividad = async (actividad: Actividad): Promise<Actividad> => {
  try {
    const response = await fetch(ENDPOINTS.ACTIVIDAD, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(actividad),
    });
    if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
    showSuccessAlert('Actividad creada correctamente');
    return await response.json();
  } catch (error) {
    return handleError(error, "Error al crear la actividad");
  }
};

// Actualizar una actividad existente
export const updateActividad = async (id: number, actividad: Actividad): Promise<void> => {
  try {
    const response = await fetch(`${ENDPOINTS.ACTIVIDAD}/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(actividad),
    });
    if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
    showSuccessAlert('Actividad actualizada correctamente');
  } catch (error) {
    handleError(error, "Error al actualizar la actividad");
  }
};

// Eliminar una actividad
export const deleteActividad = async (id: number): Promise<void> => {
  try {
    const response = await fetch(`${ENDPOINTS.ACTIVIDAD}/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
    showSuccessAlert('Actividad eliminada correctamente');
  } catch (error) {
    handleError(error, "Error al eliminar la actividad");
  }
};