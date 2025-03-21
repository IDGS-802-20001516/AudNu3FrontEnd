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
    const response = await fetch(ENDPOINTS.ACTIVIDAD);
    return await response.json();
  } catch (error) {
    console.error("Error al obtener las actividades:", error);
    return [];
  }
};

export const getUsuario = async () => {
  try {
    const response = await fetch(ENDPOINTS.USUARIOS);
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
    const response = await fetch(ENDPOINTS.PROCESOS);
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
  return fetchData<PlanAuditoria>(ENDPOINTS.PLAN_AUDITORIA, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(planAuditoria),
  });
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

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(planAuditoria),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error del servidor:", errorData);
      throw new Error(`Error: ${response.status} - ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error al guardar el plan de auditoría:", error);
    throw error;
  }
};

export const registrarHallazgo = async (hallazgo: { id_Auditoria: number; idProceso: number; descripcion: string }) => {
  try {
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