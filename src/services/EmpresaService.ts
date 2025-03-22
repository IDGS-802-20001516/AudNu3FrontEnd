import { ENDPOINTS } from '../config/endpoints';
import Swal from 'sweetalert2';

export interface Empresa {
  id_Empresas: number;
  nombreEmpresa: string;
  imagenBase64?: string;
  estado?: boolean; // Agregado para eliminación lógica
}

export const getEmpresas = async (): Promise<Empresa[]> => {
  try {
    const response = await fetch(ENDPOINTS.EMPRESAS, {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`, // Agregado para consistencia
      },
    });
    if (!response.ok) {
      throw new Error('Error al obtener las empresas');
    }
    return response.json(); // Solo devolverá empresas con estado = true
  } catch (error) {
    Swal.fire('Error', (error as Error).message, 'error');
    throw error;
  }
};

export const getEmpresasAll = async (): Promise<Empresa[]> => {
  try {
    const response = await fetch(ENDPOINTS.EMPRESASALL, {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`, // Agregado para consistencia
      },
    });
    if (!response.ok) {
      throw new Error('Error al obtener las empresas');
    }
    return response.json(); // Solo devolverá empresas con estado = true
  } catch (error) {
    Swal.fire('Error', (error as Error).message, 'error');
    throw error;
  }
};  

export const getEmpresaById = async (id: number): Promise<Empresa> => {
  try {
    const response = await fetch(`${ENDPOINTS.EMPRESAS}/${id}`, {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
      },
    });
    if (!response.ok) {
      throw new Error('Error al obtener la empresa');
    }
    return response.json(); // Solo devolverá empresas con estado = true
  } catch (error) {
    Swal.fire('Error', (error as Error).message, 'error');
    throw error;
  }
};

export const createEmpresa = async (empresa: Omit<Empresa, 'id_Empresas'>): Promise<Empresa> => {
  try {
    const formData = new FormData();
    formData.append("nombreEmpresa", empresa.nombreEmpresa);
    if (empresa.imagenBase64) {
      formData.append("imagenBase64", empresa.imagenBase64);
    }
    // No necesitamos enviar estado, el backend lo establece como true

    const response = await fetch(ENDPOINTS.EMPRESAS, {
      method: 'POST',
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorResponse = await response.json();
      throw new Error(errorResponse.message || 'Error al crear la empresa');
    }

    const createdEmpresa = await response.json();
    Swal.fire('Éxito', 'Empresa creada correctamente', 'success');
    return createdEmpresa;
  } catch (error) {
    Swal.fire('Error', (error as Error).message, 'error');
    throw error;
  }
};

export const updateEmpresa = async (id: number, empresa: Empresa): Promise<void> => {
  try {
    const formData = new FormData();
    formData.append("id_Empresas", empresa.id_Empresas.toString());
    formData.append("nombreEmpresa", empresa.nombreEmpresa);
    if (empresa.imagenBase64) {
      formData.append("imagenBase64", empresa.imagenBase64);
    }
    // No modificamos estado aquí, se mantiene como true

    const response = await fetch(`${ENDPOINTS.EMPRESAS}/${id}`, {
      method: 'PUT',
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorResponse = await response.json();
      throw new Error(errorResponse.message || `Error al actualizar la empresa: ${response.status} ${response.statusText}`);
    }

    Swal.fire('Éxito', 'Empresa actualizada correctamente', 'success');
  } catch (error) {
    Swal.fire('Error', (error as Error).message, 'error');
    throw error;
  }
};

export const deleteEmpresa = async (id: number): Promise<void> => {
  try {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "La empresa será desactivada y no estará disponible.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, desactivar empresa',
      cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) {
      throw new Error('Acción cancelada');
    }

    const response = await fetch(`${ENDPOINTS.EMPRESAS}/${id}`, {
      method: 'DELETE',
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (!response.ok) {
      const errorResponse = await response.json();
      throw new Error(errorResponse.message || 'Error al desactivar la empresa');
    }

    Swal.fire('Éxito', 'Empresa desactivada correctamente', 'success');
  } catch (error) {
    Swal.fire('Error', (error as Error).message, 'error');
    throw error;
  }
};