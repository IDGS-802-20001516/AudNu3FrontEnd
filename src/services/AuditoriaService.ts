import { ENDPOINTS } from "../config/endpoints";
import Swal from 'sweetalert2';

export interface Auditoria {
  id_Auditoria: number;
  nombreAuditoria: string;
  id_Empresa: number;
  fechaInicio: string;
  fechaFinalizacion: string;
  auditorResponsable: string;
  nota: string;
  estado: string;
}

export const getAuditorias = async (): Promise<Auditoria[]> => {
  const response = await fetch(ENDPOINTS.AUDITORIAS);
  if (!response.ok) {
    throw new Error('Error al obtener las auditorías');
  }
  return response.json();
};

export const getAllAuditorias = async (): Promise<Auditoria[]> => {
  const response = await fetch(ENDPOINTS.AUDITORIASALL);
  if (!response.ok) {
    throw new Error('Error al obtener las auditorías');
  }
  return response.json();
};

export const getAuditoriaById = async (id: number): Promise<Auditoria> => {
  const response = await fetch(`${ENDPOINTS.AUDITORIAS}/${id}`);
  if (!response.ok) {
    throw new Error('Error al obtener la auditoría');
  }
  return response.json();
};

export const createAuditoria = async (auditoria: Omit<Auditoria, 'id_Auditoria'>): Promise<Auditoria> => {
  const response = await fetch(ENDPOINTS.AUDITORIAS, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(auditoria),
  });

  if (!response.ok) {
    const errorData = await response.text(); // Lee la respuesta como texto
    throw new Error(`Error al crear la auditoría: ${errorData}`);
  }

  return response.json();
};

export const updateAuditoria = async (id: number, auditoria: Auditoria): Promise<Auditoria> => {
  const result = await Swal.fire({
    title: '¿Estás seguro?',
    text: "¿Quieres actualizar esta auditoría?",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sí, actualizar!'
  });

  if (result.isConfirmed) {
    const response = await fetch(`${ENDPOINTS.AUDITORIAS}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(auditoria),
    });

    if (!response.ok) {
      const errorData = await response.text(); // Lee la respuesta como texto
      throw new Error(`Error al actualizar la auditoría: ${errorData}`);
    }

    Swal.fire(
      'Actualizado!',
      'La auditoría ha sido actualizada.',
      'success'
    );

    return response.json();
  } else {
    throw new Error('Actualización cancelada');
  }
};

export const deleteAuditoria = async (id: number): Promise<void> => {
  const result = await Swal.fire({
    title: '¿Estás seguro?',
    text: "¡No podrás revertir esto!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sí, eliminarlo!'
  });

  if (result.isConfirmed) {
    const response = await fetch(`${ENDPOINTS.AUDITORIAS}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Error al eliminar la auditoría');
    }
    Swal.fire(
      'Eliminado!',
      'La auditoría ha sido eliminada.',
      'success'
    );
  }
};