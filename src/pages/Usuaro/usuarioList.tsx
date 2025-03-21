import React, { useEffect, useState, useCallback, useMemo } from "react";
import { getUsuarios, deleteUsuario, getRoles, getEmpresas } from "../../services/UsuarioService";
import { Usuario } from "../../services/UsuarioService";
import "../../styles/cards.css";

// Carga diferida del modal
const UsuarioFormModal = React.lazy(() => import("../Usuaro/usuarioForm"));

const UsuarioList: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [roles, setRoles] = useState<{ idRol: number; nombreRol: string }[]>([]);
  const [empresas, setEmpresas] = useState<{ id_Empresas: number; nombreEmpresa: string; imagenBase64?: string; }[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [selectedUsuarioId, setSelectedUsuarioId] = useState<number | undefined>(undefined);

  // Función para cargar usuarios
  const fetchUsuarios = async () => {
    try {
      const usuariosData = await getUsuarios();
      setUsuarios(usuariosData);
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
    }
  };

  // Cargar usuarios, roles y empresas en paralelo
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usuariosData, rolesData, empresasData] = await Promise.all([
          getUsuarios(),
          getRoles(),
          getEmpresas(), // Obtener la lista de empresas
        ]);
        setUsuarios(usuariosData);
        setRoles(rolesData);
        setEmpresas(empresasData);
      } catch (error) {
        console.error("Error al obtener datos:", error);
      }
    };

    fetchData();
  }, []);

  // Memoizar la función para obtener el nombre del rol
  const getRolNombre = useMemo(() => {
    return (idRol: number) => {
      const rol = roles.find((r) => r.idRol === idRol);
      return rol ? rol.nombreRol : "Desconocido";
    };
  }, [roles]);

  // Memoizar la función para obtener el nombre de la empresa
  const getNombreEmpresa = useMemo(() => {
    return (idEmpresa: number) => {
      const empresa = empresas.find((e) => e.id_Empresas === idEmpresa);
      return empresa ? empresa.nombreEmpresa : "Desconocido";
    };
  }, [empresas]);

  // Memoizar la función para eliminar un usuario
  const handleDelete = useCallback(async (id: number) => {
    try {
      await deleteUsuario(id);
      setUsuarios((prevUsuarios) => prevUsuarios.filter((usuario) => usuario.idUsuario !== id));
    } catch (error) {
      console.error("Error al eliminar el usuario:", error);
    }
  }, []);

  // Memoizar la función para abrir el modal
  const handleOpenModal = useCallback((id?: number) => {
    setSelectedUsuarioId(id);
    setShowModal(true);
  }, []);

  // Componente de tarjeta de usuario memoizado
  const UsuarioCard = React.memo(({ usuario, handleOpenModal, handleDelete, getRolNombre, getNombreEmpresa }: {
    usuario: Usuario;
    handleOpenModal: (id?: number) => void;
    handleDelete: (id: number) => void;
    getRolNombre: (idRol: number) => string;
    getNombreEmpresa: (idEmpresa: number) => string;
  }) => (
    <div key={usuario.idUsuario} className="col-md-4 mb-3">
      <div className="card shadow-sm text-center p-3 card-hover">
        <div className="d-flex">
          {/* Imagen de perfil */}
          {usuario.fotoPerfil ? (
            <img
              src={usuario.fotoPerfil}
              alt={`Foto de perfil de ${usuario.nombre}`}
              className="rounded-circle"
              style={{ width: "80px", height: "80px", objectFit: "cover", border: "3px solid #ddd" }}
              loading="lazy"
            />
          ) : (
            <div
              className="rounded-circle bg-secondary d-flex align-items-center justify-content-center"
              style={{ width: "80px", height: "80px" }}
            >
              <span className="text-white">Sin Foto</span>
            </div>
          )}

          {/* Nombre y Rol */}
          <div className="nombre-rol-container text-left">
            <h5 className="card-title mb-1">{usuario.nombre}</h5>
            <p className="card-text font-weight-bold mb-0">{usuario.idRol !== null ? getRolNombre(usuario.idRol) : "Desconocido"}</p>
          </div>
        </div>

        {/* Datos del usuario */}
        <div className="card-body p-0 mt-2">
          <p className="card-text small text-muted mb-1">📧 <strong>Correo:</strong> {usuario.correo}</p>
          <p className="card-text small text-muted mb-1">📞 <strong>Teléfono:</strong> {usuario.telefono}</p>
          <p className="card-text small text-muted mb-1">🏢 <strong>Empresa:</strong> {usuario.idEmpresa !== null ? getNombreEmpresa(usuario.idEmpresa) : "Desconocido"}</p>
        </div>

        {/* Botones de acción */}
        <div className="d-flex justify-content-around mt-3">
          <button
            onClick={() => handleOpenModal(usuario.idUsuario)}
            className="btn btn-outline-warning btn-sm"
            style={{ fontFamily:"monospace", color: "black" }}
          >
            ✏️ Editar
          </button>
          <button
            onClick={() => handleDelete(usuario.idUsuario)}
            className="btn btn-outline-danger btn-sm"
            style={{ fontFamily:"monospace", color: "black" }}
          >
            🗑️ Eliminar
          </button>
        </div>
      </div>
    </div>
  ));

  return (
    <div className="container mt-5">
       <h2 style={{ 
          fontFamily: 'revert-layer', 
          color: "#800020", 
          fontWeight: "bold", 
          letterSpacing: "1px" 
        }}>
          Usuarios
        </h2>
      <div className="d-flex justify-content-end mb-3">
        <button onClick={() => handleOpenModal()} className="btn btn-primary" style={{ backgroundColor: "maroon", color: "white" }}>
          Crear Nuevo Usuario
        </button>
      </div>
      <div className="row">
        {usuarios.map((usuario) => (
          <UsuarioCard
            key={usuario.idUsuario}
            usuario={usuario}
            handleOpenModal={handleOpenModal}
            handleDelete={handleDelete}
            getRolNombre={getRolNombre}
            getNombreEmpresa={getNombreEmpresa}
          />
        ))}
      </div>

      {/* Modal de creación/edición de usuario */}
      {showModal && (
        <React.Suspense fallback={<div>Cargando...</div>}>
          <UsuarioFormModal
            idUsuario={selectedUsuarioId}
            show={showModal}
            handleClose={() => setShowModal(false)}
            onUsuarioSaved={() => {
              setShowModal(false);
              fetchUsuarios();
            }}
          />
        </React.Suspense>
      )}
    </div>
  );
};

export default React.memo(UsuarioList);