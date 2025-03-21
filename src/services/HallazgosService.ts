import { ENDPOINTS } from "../config/endpoints";
import Swal from 'sweetalert2';

export interface VistaHallazgo {
  iD_Hallazgo: number;
  iD_Auditoria: number;
  nombre_Auditoria: string;
  nombre_Proceso: string;
  nombre_Actividad: string;
  montoImpacto: number;
  semaforo: string;
  descripcion: string;
  riesgo: string;
  recomendaciones: string;
  planAccion: string;
  nombre_Responsable: string;
  fechaCompromiso: string;
  cumplido: boolean;
  seguimiento : string;
  idUsuario : number;
  idRol: number;
  idEmpresa: number;
}

export interface Hallazgo{
  idHallazgo: number;
  idPlanAuditoria: number,
  idActividad: number,
  idResponsable: number,
  montoImpacto: number,
  semaforo:string,
  descripcion: string,
  riesgo: string,
  recomendaciones: string,
  planAccion: string,
  fechaCompromiso:  string | null;
  cumplido: boolean,
  seguimiento: string
}

export const getHallazgos = async (): Promise<VistaHallazgo[]> => {
  try {
    const response = await fetch(ENDPOINTS.HALLAZGOSVISTA);
    if (!response.ok) {
      throw new Error('Error al obtener los hallazgos');
    }
    return response.json();
  } catch (error) {
    Swal.fire('Error', (error as Error).message, 'error');
    throw error;
  }
};

export const getHallazgoById = async (id: number): Promise<Hallazgo> => {
  try {
    const response = await fetch(`${ENDPOINTS.HALLAZGOS}/${id}`);
    if (!response.ok) {
      throw new Error('Error al obtener el hallazgo');
    }
    return response.json();
  } catch (error) {
    Swal.fire('Error', (error as Error).message, 'error');
    throw error;
  }
};

export const createHallazgo = async (hallazgo: Omit<Hallazgo, 'idHallazgo'>): Promise<Hallazgo> => {
  try {
    console.log('Creating Hallazgo:', hallazgo);

    const response = await fetch(ENDPOINTS.HALLAZGOS, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(hallazgo),
    });

    if (!response.ok) {
      // Si la respuesta no es JSON, intenta leerla como texto
      const errorText = await response.text();
      throw new Error(errorText || 'Error al crear el hallazgo');
    }

    const createdHallazgo = await response.json();
    console.log('Hallazgo created:', createdHallazgo);

    Swal.fire('Éxito', 'Hallazgo creado correctamente', 'success');
    return createdHallazgo;
  } catch (error) {
    console.error("Error en createHallazgo:", error);
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

export const getUsuario = async ()=> {
  try{
    const response = await fetch(ENDPOINTS.USUARIOS);
    return await response.json();
  } catch (error){
    console.error("Error al obtener los usuarios", error);
    return[];
  }
}

export const getAuditorias = async ()=> {
  try{
    const response = await fetch(ENDPOINTS.AUDITORIAS);
    return await response.json();
  } catch (error){
    console.error("Error al obtener los auditorias", error);
    return[];
  }
}

export const updateHallazgo = async (id: number, hallazgo: Hallazgo): Promise<VistaHallazgo> => {
  try {
    console.log('Updating Hallazgo with ID:', id);
    console.log('Hallazgo data:', hallazgo);

    const response = await fetch(`${ENDPOINTS.HALLAZGOS}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(hallazgo),
    });
    if (!response.ok) {
      throw new Error('Error al actualizar el hallazgo');
    }
    const updatedHallazgo = await response.json();
    Swal.fire('Éxito', 'Hallazgo actualizado correctamente', 'success');
    return updatedHallazgo;
  } catch (error) {
    Swal.fire('Error', (error as Error).message, 'error');
    throw error;
  }
};

export const deleteHallazgo = async (id: number): Promise<void> => {
  try {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "¡No podrás revertir esto!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar hallazgo'
    });

    if (!result.isConfirmed) {
      throw new Error('Acción cancelada');
    }

    const response = await fetch(`${ENDPOINTS.HALLAZGOS}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Error al eliminar el hallazgo');
    }
    Swal.fire('Éxito', 'Hallazgo eliminado correctamente', 'success');
  } catch (error) {
    Swal.fire('Error', (error as Error).message, 'error');
    throw error;
  }
};