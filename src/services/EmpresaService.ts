import { ENDPOINTS } from '../config/endpoints';

export interface Empresa {
  id_Empresas: number;
  nombreEmpresa: string;
  imagenBase64?: string;
}

export const getEmpresas = async (): Promise<Empresa[]> => {
  const response = await fetch(ENDPOINTS.EMPRESAS);
  if (!response.ok) {
    throw new Error('Error al obtener las empresas');
  }
  return response.json();
};

export const getEmpresaById = async (id: number): Promise<Empresa> => {
  const response = await fetch(`${ENDPOINTS.EMPRESAS}/${id}`);
  if (!response.ok) {
    throw new Error('Error al obtener la empresa');
  }
  return response.json();
};

export const createEmpresa = async (empresa: Omit<Empresa, 'id_Empresas'>): Promise<Empresa> => {
  const formData = new FormData();
  formData.append("nombreEmpresa", empresa.nombreEmpresa);
  if (empresa.imagenBase64) {
    formData.append("imagenBase64", empresa.imagenBase64);
  }

  const response = await fetch(ENDPOINTS.EMPRESAS, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Error al crear la empresa');
  }

  return response.json();
};

export const updateEmpresa = async (id: number, empresa: Empresa): Promise<void> => {
  const formData = new FormData();
  formData.append("id_Empresas", empresa.id_Empresas.toString());
  formData.append("nombreEmpresa", empresa.nombreEmpresa);
  if (empresa.imagenBase64) {
    formData.append("imagenBase64", empresa.imagenBase64); // Enviar solo si hay una imagen
  }

  const response = await fetch(`${ENDPOINTS.EMPRESAS}/${id}`, {
    method: 'PUT',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Error al actualizar la empresa: ${response.status} ${response.statusText}`);
  }
  // No intentamos parsear la respuesta como JSON porque el servidor devuelve 204 No Content
};

export const deleteEmpresa = async (id: number): Promise<void> => {
  const response = await fetch(`${ENDPOINTS.EMPRESAS}/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Error al eliminar la empresa');
  }
};