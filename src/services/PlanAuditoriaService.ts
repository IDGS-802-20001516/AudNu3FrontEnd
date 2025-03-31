import { ENDPOINTS } from "../config/endpoints";
import Swal from 'sweetalert2';

export interface PlanAuditoria {
  idPlanAuditoria: number;
  id_Auditoria: number;
  idProceso: number;
  idActividad: number;
  idAuditor: number;
  fechaInicio: string;
  fechaFin: string | null;
  estado: string;
  semaforo: string;
  redaccion: boolean;
  revisado: boolean;
  comentarios: string;
  estatus: boolean;
}

export const createBulkPlanAuditoriaByProcess = async (idAuditoria: number, idProceso: number): Promise<PlanAuditoria[]> => {
  try {
    const response = await fetch(`${ENDPOINTS.PLAN_AUDITORIA}/bulk/by-process/${idAuditoria}/${idProceso}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const errorText = await response.text();
      Swal.fire('Error', errorText || 'Error al crear los planes por proceso', 'error');
      throw new Error(errorText || 'Error al crear los planes por proceso');
    }

    const data = await response.json();
    Swal.fire('Éxito', 'Planes de auditoría creados para el proceso seleccionado', 'success');
    return data;
  } catch (error) {
    Swal.fire('Error', (error as Error).message, 'error');
    throw error;
  }
};

export const createBulkPlanAuditoriaAllActivities = async (idAuditoria: number): Promise<PlanAuditoria[]> => {
  try {
    const response = await fetch(`${ENDPOINTS.PLAN_AUDITORIA}/bulk/all-activities/${idAuditoria}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const errorText = await response.text();
      Swal.fire('Error', errorText || 'Error al crear los planes para todas las actividades', 'error');
      throw new Error(errorText || 'Error al crear los planes para todas las actividades');
    }

    const data = await response.json();
    Swal.fire('Éxito', 'Planes de auditoría creados para todas las actividades', 'success');
    return data;
  } catch (error) {
    Swal.fire('Error', (error as Error).message, 'error');
    throw error;
  }
};

// Define el tipo para BulkPlanAuditoriaDTO
export interface BulkPlanAuditoriaDTO {
  idAuditor: number;
  fechaInicio: string;
  fechaFin: string | null;
  comentarios: string;
}


// Función genérica para manejar las peticiones
const fetchData = async <T>(url: string, options?: RequestInit): Promise<T> => {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Error en la solicitud');
    }
    return response.json();
  } catch (error) {
    Swal.fire('Error', (error as Error).message, 'error');
    throw error;
  }
};

export const getActividades = async () => {
  try {
    const response = await fetch(ENDPOINTS.ACTIVIDADALL);
    return await response.json();
  } catch (error) {
    console.error("Error al obtener las actividades:", error);
    return [];
  }
};

export const getUsuario = async () => {
  try {
    const response = await fetch(ENDPOINTS.USUARIOSALL);
    return await response.json();
  } catch (error) {
    console.error("Error al obtener las actividades:", error);
    return [];
  }
};

export const getCriterios = async () => {
  try {
    const response = await fetch(ENDPOINTS.CRITERIOS);
    return await response.json();
  } catch (error) {
    console.error("Error al obtener las actividades:", error);
    return [];
  }
};


export const getProcesos = async () => {
  try {
    const response = await fetch(ENDPOINTS.PROCESOSALL);
    return await response.json();
  } catch (error) {
    console.error("Error al obtener los procesos:", error);
    return [];
  }
};

export const getAuditorias = async () => {
  try {
    const response = await fetch(ENDPOINTS.AUDITORIAS);
    return await response.json();
  } catch (error) {
    console.error("Error al obtener los roles:", error);
    return [];
  }
};

export const getPlanesAuditoria = async (): Promise<PlanAuditoria[]> => {
  return fetchData<PlanAuditoria[]>(ENDPOINTS.PLAN_AUDITORIA);
};

export const getPlanAuditoriaById = async (id: number): Promise<PlanAuditoria> => {
  return fetchData<PlanAuditoria>(`${ENDPOINTS.PLAN_AUDITORIA}/${id}`);
};

export const createPlanAuditoria = async (planAuditoria: Omit<PlanAuditoria, 'idPlanAuditoria'>): Promise<PlanAuditoria> => {
  try {
    const response = await fetch(ENDPOINTS.PLAN_AUDITORIA, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(planAuditoria),
    });

    console.log("Response:", response); // Agrega este log para depuración
    // Verifica si la respuesta es exitosa (código 2xx)     
    // Si no es exitosa, lanza un error con el mensaje de error del servidor
    // o un mensaje genérico si no hay texto en la respuesta
    // Puedes ajustar el manejo de errores según tus necesidades
    // o el formato de error que devuelve tu API
    if (!response.ok) {
      const errorText = await response.text();
      Swal.fire('Error', errorText || 'Error al crear el plan de auditoría', 'error');
      throw new Error(errorText || 'Error al crear el plan de auditoría');
    }

    const data = await response.json();
    Swal.fire('Éxito', 'Plan de auditoría creado correctamente', 'success');
    return data;
  } catch (error) {
    Swal.fire('Error', (error as Error).message, 'error');
    throw error;
  }
};

export const updatePlanAuditoria = async (id: number, planAuditoria: PlanAuditoria): Promise<PlanAuditoria> => {
  return fetchData<PlanAuditoria>(`${ENDPOINTS.PLAN_AUDITORIA}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(planAuditoria),
  });
};

export const savePlanAuditoria = async (planAuditoria: PlanAuditoria) => {
  try {
    const url = planAuditoria.idPlanAuditoria
      ? `${ENDPOINTS.PLAN_AUDITORIA}/${planAuditoria.idPlanAuditoria}` // PUT para editar
      : `${ENDPOINTS.PLAN_AUDITORIA}`; // POST para crear

    const method = planAuditoria.idPlanAuditoria ? "PUT" : "POST";

    console.log("Enviando solicitud a:", url); // Depuración
    console.log("Método:", method); // Depuración
    console.log("Cuerpo de la solicitud:", JSON.stringify(planAuditoria, null, 2)); // Depuración

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(planAuditoria),
    });

    if (!response.ok) {
      const errorText = await response.text();
      Swal.fire('Error', `Error del servidor: ${response.status} - ${errorText || response.statusText}`, 'error');
      throw new Error(`Error: ${response.status} - ${errorText || response.statusText}`);
    }

    Swal.fire('Éxito', 'Plan de auditoría guardado correctamente', 'success');
    return await response.json();
  } catch (error) {
    Swal.fire('Error', 'Error al guardar el plan de auditoría: ' + (error as Error).message, 'error');
    console.error("Error al guardar el plan de auditoría:", error);
    throw error;
  }
};

export const registrarHallazgo = async (hallazgo: { id_Auditoria: number; idProceso: number; descripcion: string }) => {
  try {
    console.log("Datos enviados para registrar el hallazgo:", hallazgo);

    const response = await fetch("URL_DEL_BACKEND/hallazgos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(hallazgo),
    });

    if (!response.ok) {
      throw new Error("Error al registrar el hallazgo");
    }

    return await response.json();
  } catch (error) {
    console.error("Error en registrarHallazgo:", error);
    throw error;
  }
};



export const deletePlanAuditoria = async (id: number): Promise<void> => {
  const result = await Swal.fire({
    title: '¿Estás seguro?',
    text: '¡No podrás revertir esto!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sí, eliminar plan'
  });

  if (!result.isConfirmed) return;

  try {
    const response = await fetch(`${ENDPOINTS.PLAN_AUDITORIA}/${id}`, {
      method: 'DELETE', // O usa 'PUT' si estás actualizando el estatus
    });

    if (!response.ok) {
      throw new Error("Error al desactivar el plan de auditoría");
    }

    Swal.fire('Éxito', 'Plan de auditoría desactivado correctamente', 'success');
  } catch (error) {
    console.error("Error en deletePlanAuditoria:", error);
    Swal.fire('Error', 'No se pudo desactivar el plan de auditoría', 'error');
    throw error;
  }
};