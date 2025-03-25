import React, { useEffect, useState } from "react";
import { getAuditorias, deleteAuditoria, updateAuditoria, createAuditoria } from "../../services/AuditoriaService";
import { Auditoria } from "../../services/AuditoriaService";
import { Empresa, getEmpresas } from "../../services/EmpresaService";
import { getUsuarios, Usuario } from "../../services/UsuarioService";
import AuditoriaForm from "./AuditoriasForm";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const AuditoriaList: React.FC = () => {
  const [auditorias, setAuditorias] = useState<Auditoria[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [currentAuditoria, setCurrentAuditoria] = useState<Auditoria>({
    id_Auditoria: 0,
    nombreAuditoria: "",
    id_Empresa: 0,
    fechaInicio: "",
    fechaFinalizacion: "",
    auditorResponsable: "",
    nota: "",
    estado: "Pendiente",
  });
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
    fetchAuditorias();
    fetchEmpresas();
    fetchUsuarios();
  }, [navigate]);

  const fetchAuditorias = async () => {
    try {
      const data = await getAuditorias();
      setAuditorias(data);
    } catch (error) {
      console.error("Error al obtener las auditorías:", error);
    }
  };

  const fetchEmpresas = async () => {
    try {
      const data = await getEmpresas();
      setEmpresas(data);
    } catch (error) {
      console.error("Error al obtener las empresas:", error);
    }
  };

  const fetchUsuarios = async () => {
    try {
      const data = await getUsuarios();
      setUsuarios(data);
    } catch (error) {
      console.error("Error al obtener los usuarios:", error);
    }
  };

  const handleDelete = async (id: number) => {
    const confirmDelete = await Swal.fire({
      title: "¿Estás seguro?",
      text: "No podrás revertir esta acción.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!confirmDelete.isConfirmed) {
      return;
    }

    try {
      await deleteAuditoria(id);
      setAuditorias(auditorias.filter((auditoria) => auditoria.id_Auditoria !== id));
      Swal.fire("Eliminado", "La auditoría ha sido eliminada con éxito.", "success");
    } catch (error) {
      console.error("Error al eliminar la auditoría:", error);
      Swal.fire("Error", "Hubo un error al intentar eliminar la auditoría.", "error");
    }
  };

  const handleEdit = (auditoria: Auditoria) => {
    setCurrentAuditoria(auditoria);
    setShowModal(true);
  };

  const handleCreate = () => {
    setCurrentAuditoria({
      id_Auditoria: 0,
      nombreAuditoria: "",
      id_Empresa: 0,
      fechaInicio: "",
      fechaFinalizacion: "",
      auditorResponsable: "",
      nota: "",
      estado: "Pendiente",
    });
    setShowModal(true);
  };

  const handleSave = async (auditoria: Auditoria) => {
    try {
      let updatedAuditoria: Auditoria;
      if (auditoria.id_Auditoria) {
        updatedAuditoria = await updateAuditoria(auditoria.id_Auditoria, auditoria);
        setAuditorias(
          auditorias.map((a) =>
            a.id_Auditoria === updatedAuditoria.id_Auditoria ? updatedAuditoria : a
          )
        );
      } else {
        updatedAuditoria = await createAuditoria(auditoria);
        setAuditorias([...auditorias, updatedAuditoria]);
      }
      setShowModal(false);
      setCurrentAuditoria({
        id_Auditoria: 0,
        nombreAuditoria: "",
        id_Empresa: 0,
        fechaInicio: "",
        fechaFinalizacion: "",
        auditorResponsable: "",
        nota: "",
        estado: "Pendiente",
      });
    } catch (error) {
      console.error("Error al guardar la auditoría:", error);
    }
  };

  // Función para obtener el nombre de la empresa basado en el id_Empresa
  const getNombreEmpresa = (id_Empresa: number): string => {
    const empresa = empresas.find((emp) => emp.id_Empresas === id_Empresa);
    return empresa ? empresa.nombreEmpresa : "Desconocido";
  };

  return (
    <div className="container mt-5">
       <h2 style={{ 
          fontFamily: 'revert-layer', 
          color: "#800020", 
          fontWeight: "bold", 
          letterSpacing: "1px" 
        }}>
          Auditorias
        </h2>
      <div className="d-flex justify-content-end mb-3">
        <button className="btn btn-success" style={{ backgroundColor: "#800020", borderColor: "#800020" }} onClick={handleCreate}>
          Crear Nueva Auditoría
        </button>
      </div>
      <div className="row">
        {auditorias.map((auditoria) => (
          <div key={auditoria.id_Auditoria} className="col-md-4 mb-4">
            <div className="card shadow-sm">
              <div className="card-body">
                <h5 className="card-title">{auditoria.nombreAuditoria}</h5>
                <p className="card-text">Empresa: {getNombreEmpresa(auditoria.id_Empresa)}</p>
                <p className="card-text">
                  Estado:{" "}
                  <span
                    className={`badge ${
                      auditoria.estado === "Pendiente"
                        ? "bg-warning"
                        : auditoria.estado === "En proceso"
                        ? "bg-primary"
                        : "bg-success"
                    }`}
                  >
                    {auditoria.estado}
                  </span>
                </p>
                <div className="d-flex justify-content-between">
                  <button
                    className="btn btn-warning btn-sm"
                    onClick={() => handleEdit(auditoria)}
                  >
                    Editar
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(auditoria.id_Auditoria)}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <AuditoriaForm
        show={showModal}
        onHide={() => setShowModal(false)}
        auditoria={currentAuditoria}
        empresas={empresas}
        usuarios={usuarios}
        onChange={(e) =>
          setCurrentAuditoria({
            ...currentAuditoria,
            [e.target.name]: e.target.value,
          })
        }
        onSubmit={(e) => {
          e.preventDefault();
          handleSave(currentAuditoria);
        }}
        isEditing={!!currentAuditoria.id_Auditoria}
      />
    </div>
  );
};

export default AuditoriaList;