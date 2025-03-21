import React, { useEffect, useState, useCallback } from "react";
import { getEmpresas, deleteEmpresa } from "../../services/EmpresaService";
import { Empresa } from "../../services/EmpresaService";
import { useNavigate } from "react-router-dom";
import EmpresaForm from "./EmpresasForm"; 
import Button from "react-bootstrap/Button";

const EmpresaList: React.FC = () => {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedEmpresaId, setSelectedEmpresaId] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("token")) navigate("/login");

    const fetchEmpresas = async () => {
      try {
        const data = await getEmpresas();
        setEmpresas(data);
      } catch (error) {
        console.error("Error al obtener las empresas:", error);
      }
    };

    fetchEmpresas();
  }, [navigate]);

  const handleDelete = useCallback(async (id: number) => {
    try {
      await deleteEmpresa(id);
      setEmpresas((prevEmpresas) =>
        prevEmpresas.filter((empresa) => empresa.id_Empresas !== id)
      );
    } catch (error) {
      console.error("Error al eliminar la empresa:", error);
    }
  }, []);

  const handleOpenModal = (id?: number) => {
    setSelectedEmpresaId(id || null); // Si no hay ID, es una nueva empresa
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedEmpresaId(null);
  };

  const handleSaveSuccess = () => {
    // Recargar la lista de empresas después de guardar
    const fetchEmpresas = async () => {
      try {
        const data = await getEmpresas();
        setEmpresas(data);
      } catch (error) {
        console.error("Error al obtener las empresas:", error);
      }
    };
    fetchEmpresas();
    handleCloseModal();
  };

  return (
    <div className="container mt-5">
       <h2 style={{ 
          fontFamily: 'revert-layer', 
          color: "#800020", 
          fontWeight: "bold", 
          letterSpacing: "1px" 
        }}>
          Empresas
        </h2>
      <div className="d-flex justify-content-end mb-3">
        <Button
     variant="primary"
    style={{ backgroundColor: "#800020", borderColor: "#800020" }}
    onClick={() => handleOpenModal(undefined)} // Aseguramos que id sea undefined para nuevo registro
  >
    Agregar Nueva Empresa
  </Button>
      </div>
      <div className="row">
        {empresas.map(({ id_Empresas, nombreEmpresa, imagenBase64 }) => (
          <div key={id_Empresas} className="col-md-3 mb-4">
            <div className="card shadow-sm">
              {imagenBase64 && (
                <img
                  src={imagenBase64}
                  alt={nombreEmpresa}
                  className="card-img-top"
                  style={{ width: "100%", height: "100px", objectFit: "contain" }}
                />
              )}
              <div className="card-body">
                <h5 className="card-title">{nombreEmpresa}</h5>
                <br></br>
                <div style={{fontFamily:"monospace",color:"black"}}className="d-flex justify-content-between">
                    <Button
                    variant="outline-warning"
                    size="sm"
                    className="me-2"
                    onClick={() => handleOpenModal(id_Empresas)}
                    >
                    ✏️ Editar
                    </Button>
                    <Button
                    variant="outline-danger"
                    size="sm"
                    
                    onClick={() => handleDelete(id_Empresas)}
                    >
                    🗑️ Eliminar
                    </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Renderizar el modal del formulario */}
      <EmpresaForm
        show={showModal}
        onHide={handleCloseModal}
        id={selectedEmpresaId?.toString()} // Pasar el ID como string
        onSaveSuccess={handleSaveSuccess} // Recargar la lista después de guardar
      />
    </div>
  );
};

export default EmpresaList;