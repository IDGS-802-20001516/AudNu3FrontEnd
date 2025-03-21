import React, { useEffect, useState } from "react";
import { getProcesos, createProceso, updateProceso, deleteProceso, Proceso } from "../../services/ProcesoService";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaEdit, FaTrash } from "react-icons/fa";

const ProcesoCRUD: React.FC = () => {
  const [procesos, setProcesos] = useState<Proceso[]>([]);
  const [newProceso, setNewProceso] = useState<Proceso>({ nombreProceso: "" });
  const [editingProceso, setEditingProceso] = useState<Proceso | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("token")) navigate("/login");
    fetchProcesos();
  }, [navigate]);

  const fetchProcesos = async () => {
    try {
      const data = await getProcesos();
      setProcesos(data);
      setLoading(false);
    } catch (error) {
      console.error("Error al cargar procesos:", error);
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const createdProceso = await createProceso(newProceso);
      setProcesos([...procesos, createdProceso]);
      setNewProceso({ nombreProceso: "" });
      setShowCreateModal(false);
    } catch (error) {
      console.error("Error al crear proceso:", error);
    }
  };

  const handleUpdate = async () => {
    if (!editingProceso) return;
    try {
      await updateProceso(editingProceso.idProceso!, editingProceso);
      setProcesos(procesos.map((p) => (p.idProceso === editingProceso.idProceso ? editingProceso : p)));
      setEditingProceso(null);
      setShowEditModal(false);
    } catch (error) {
      console.error("Error al actualizar proceso:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("¿Estás seguro de eliminar este proceso?")) {
      try {
        await deleteProceso(id);
        setProcesos(procesos.filter((p) => p.idProceso !== id));
      } catch (error) {
        console.error("Error al eliminar proceso:", error);
      }
    }
  };

  if (loading) return <div className="text-center mt-5">Cargando...</div>;

  return (
    <div className="container mt-5">
      <h2 className="mb-4 text-center fw-bold" style={{ fontFamily: "Roboto", color: "#333" }}>
        Gestión de Procesos
      </h2>

      {/* Botón para abrir el modal de creación */}
      <div className="mb-4 text-end">
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          Agregar Proceso
        </button>
      </div>

      {/* Tabla de procesos */}
      <div className="card shadow-sm border-0">
        <div className="card-header" style={{ backgroundColor: "#800020", color: "white" }}>
          <h5 className="card-title mb-0 fw-bold">Lista de Procesos</h5>
        </div>
        <div className="card-body">
          <table className="table table-striped table-hover">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre del Proceso</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {procesos.map((proceso) => (
                <tr key={proceso.idProceso}>
                  <td>{proceso.idProceso}</td>
                  <td>{proceso.nombreProceso}</td>
                  <td>
                    <button
                      className="btn btn-warning btn-sm me-2"
                      onClick={() => {
                      setEditingProceso(proceso);
                      setShowEditModal(true);
                      }}
                    >                    
                  <FaEdit>
                      </FaEdit>
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(proceso.idProceso!)}
                    >
                      <FaTrash>
                      </FaTrash>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para agregar proceso */}
      {showCreateModal && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Agregar Nuevo Proceso</h5>
                <button type="button" className="btn-close" onClick={() => setShowCreateModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label htmlFor="nombreProceso" className="form-label">Nombre del Proceso</label>
                  <input
                    type="text"
                    className="form-control"
                    id="nombreProceso"
                    value={newProceso.nombreProceso}
                    onChange={(e) => setNewProceso({ ...newProceso, nombreProceso: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                  Cancelar
                </button>
                <button type="button" className="btn btn-primary" onClick={handleCreate}>
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para editar proceso */}
      {showEditModal && editingProceso && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Editar Proceso</h5>
                <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label htmlFor="editNombreProceso" className="form-label">Nombre del Proceso</label>
                  <input
                    type="text"
                    className="form-control"
                    id="editNombreProceso"
                    value={editingProceso.nombreProceso}
                    onChange={(e) => setEditingProceso({ ...editingProceso, nombreProceso: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                  Cancelar
                </button>
                <button type="button" className="btn btn-primary" onClick={handleUpdate}>
                  Actualizar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProcesoCRUD;