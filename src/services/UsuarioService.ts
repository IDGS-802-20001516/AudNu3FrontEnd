import { ENDPOINTS } from "../config/endpoints";
import Swal from 'sweetalert2';
import { Empresa } from "./EmpresaService";

export interface Usuario {
  idUsuario: number;
  nombre: string;
  nombreUsuario: string;
  correo: string;
  contrasenia: string;
  idRol: number;
  estatus: boolean;
  telefono: string;
  intentos: number;
  token: string;
  fotoPerfil?: string;
  idEmpresa: number;
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
    const response = await fetch(ENDPOINTS.USUARIOS, {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
      },
    });
    if (!response.ok) {
      throw new Error('Error al obtener los usuarios');
    }
    return response.json();
  } catch (error) {
    Swal.fire('Error', (error as Error).message, 'error');
    throw error;
  }
};


export const getUsuariosAll = async (): Promise<Usuario[]> => {
  try {
    const response = await fetch(ENDPOINTS.USUARIOSALL, {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
      },
    });
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
    const response = await fetch(`${ENDPOINTS.USUARIOS}/${id}`, {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
      },
    });
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
  const response = await fetch(ENDPOINTS.EMPRESAS, {
    headers: {
      "Authorization": `Bearer ${localStorage.getItem("token")}`,
    },
  });
  if (!response.ok) {
    throw new Error('Error al obtener las auditorías');
  }
  return response.json();
};

const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (file.size > 2 * 1024 * 1024) { // 2MB
      reject(new Error("La imagen no debe exceder los 2MB."));
      return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export const createUsuario = async (usuario: Omit<Usuario, 'idUsuario'>, fotoPerfil?: File): Promise<Usuario> => {
  try {
    const formData = new FormData();
    const usuarioToCreate = { ...usuario, estatus: true };
    Object.keys(usuarioToCreate).forEach(key => {
      formData.append(key, usuarioToCreate[key as keyof Omit<Usuario, 'idUsuario'>] as string);
    });

    if (fotoPerfil) {
      const base64Image = await convertFileToBase64(fotoPerfil);
      formData.append("fotoPerfil", base64Image);
    }

    const response = await fetch(ENDPOINTS.USUARIOS, {
      method: 'POST',
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorResponse = await response.json();
      throw new Error(errorResponse.message || 'Error al crear el usuario');
    }

    const createdUsuario = await response.json();
    Swal.fire('Éxito', 'Usuario creado correctamente', 'success');
    return createdUsuario;
  } catch (error) {
    console.error("Error en createUsuario:", error);
    Swal.fire('Error', (error as Error).message, 'error');
    throw error;
  }
};

export const updateUsuario = async (id: number, usuario: Usuario, fotoPerfil?: File): Promise<Usuario> => {
  try {
    const formData = new FormData();
    const usuarioToUpdate = { ...usuario, estatus: usuario.estatus !== undefined ? usuario.estatus : true };
    Object.keys(usuarioToUpdate).forEach(key => {
      formData.append(key, usuarioToUpdate[key as keyof Usuario] as string);
    });

    if (fotoPerfil) {
      const base64Image = await convertFileToBase64(fotoPerfil);
      formData.append("fotoPerfil", base64Image);
    }

    const response = await fetch(`${ENDPOINTS.USUARIOS}/${id}`, {
      method: 'PUT',
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorResponse = await response.json();
      throw new Error(errorResponse.message || 'Error al actualizar el usuario');
    }

    const updatedUsuario = await response.json();
    Swal.fire('Éxito', 'Usuario actualizado correctamente', 'success');
    return updatedUsuario;
  } catch (error) {
    console.error("Error en updateUsuario:", error);
    Swal.fire('Error', (error as Error).message, 'error');
    throw error;
  }
};

export const deleteUsuario = async (id: number): Promise<void> => {
  try {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "El usuario será desactivado y no podrá iniciar sesión.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, desactivar usuario'
    });

    if (!result.isConfirmed) {
      throw new Error('Acción cancelada');
    }

    const response = await fetch(`${ENDPOINTS.USUARIOS}/${id}`, {
      method: 'DELETE',
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
      },
    });
    if (!response.ok) {
      throw new Error('Error al desactivar el usuario');
    }
    Swal.fire('Éxito', 'Usuario desactivado correctamente', 'success');
  } catch (error) {
    console.error("Error en deleteUsuario:", error);
    Swal.fire('Error', (error as Error).message, 'error');
    throw error;
  }
};