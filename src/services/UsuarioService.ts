import { ENDPOINTS } from "../config/endpoints";
import Swal from 'sweetalert2';
import { Empresa } from "./EmpresaService";

export interface Usuario {
  idUsuario: number;
  nombre: string;
  nombreUsuario: string;
  correo: string;
  contrasenia: string;
  idRol:number; // Cambiamos "rol" por "idRol"
  estatus: string;
  telefono: string;
  intentos: number;
  token: string;
  fotoPerfil?: string; // Nueva propiedad para la imagen de perfil
  idEmpresa: number; // Cambiamos "empresa" por "idEmpresa"
  
}

export const getRoles = async () => {
  try {
    const response = await fetch(ENDPOINTS.ROLES);
    return await response.json();
  } catch (error) {
    console.error("Error al obtener los roles:", error);
    return [];
  }
};

export const getUsuarios = async (): Promise<Usuario[]> => {
  try {
    const response = await fetch(ENDPOINTS.USUARIOS);
    if (!response.ok) {
      throw new Error('Error al obtener los usuarios');
    }
    return response.json();
  } catch (error) {
    Swal.fire('Error', (error as Error).message, 'error');
    throw error;
  }
};

export const getUsuarioById = async (id: number): Promise<Usuario> => {
  try {
    const response = await fetch(`${ENDPOINTS.USUARIOS}/${id}`);
    if (!response.ok) {
      throw new Error('Error al obtener el usuario');
    }
    return response.json();
  } catch (error) {
    Swal.fire('Error', (error as Error).message, 'error');
    throw error;
  }
};

export const getEmpresas = async (): Promise<Empresa[]> => {
  const response = await fetch(ENDPOINTS.EMPRESAS);
  if (!response.ok) {
    throw new Error('Error al obtener las auditorías');
  }
  return response.json();
};

const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export const createUsuario = async (usuario: Omit<Usuario, 'idUsuario'>, fotoPerfil?: File): Promise<Usuario> => {
  try {
    const formData = new FormData();
    Object.keys(usuario).forEach(key => {
      formData.append(key, usuario[key as keyof Omit<Usuario, 'idUsuario'>] as string);
    });

    if (fotoPerfil) {
      const base64Image = await convertFileToBase64(fotoPerfil);
      formData.append("fotoPerfil", base64Image);
    }

    const response = await fetch(ENDPOINTS.USUARIOS, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      const errorResponse = await response.json(); // Lee la respuesta de error del servidor
      console.error("Error response from server:", errorResponse);
      throw new Error(errorResponse.message || 'Error al crear el usuario');
    }
    return response.json();
  } catch (error) {
    console.error("Error en createUsuario:", error);
    throw error;
  }
};

export const updateUsuario = async (id: number, usuario: Usuario, fotoPerfil?: File): Promise<Usuario> => {
  try {
    const formData = new FormData();
    Object.keys(usuario).forEach(key => {
      formData.append(key, usuario[key as keyof Usuario] as string);
    });

    if (fotoPerfil) {
      const base64Image = await convertFileToBase64(fotoPerfil);
      formData.append("fotoPerfil", base64Image);
    }

    const response = await fetch(`${ENDPOINTS.USUARIOS}/${id}`, {
      method: 'PUT',
      body: formData,
    });
    if (!response.ok) {
      throw new Error('Error al actualizar el usuario');
    }
    return response.json();
  } catch (error) {
    throw error;
  }
};

export const deleteUsuario = async (id: number): Promise<void> => {
  try {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "¡No podrás revertir esto!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar usuario'
    });

    if (!result.isConfirmed) {
      throw new Error('Acción cancelada');
    }

    const response = await fetch(`${ENDPOINTS.USUARIOS}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Error al eliminar el usuario');
    }
    Swal.fire('Éxito', 'Usuario eliminado correctamente', 'success');
  } catch (error) {
    Swal.fire('Error', (error as Error).message, 'error');
    throw error;
  }
};
