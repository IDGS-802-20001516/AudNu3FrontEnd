import React, { useEffect, useState } from "react";
import { getActividades, createActividad, updateActividad, deleteActividad } from "../../services/ActividadService";
import { Proceso, getProcesos } from "../../services/ProcesoService";
import { useNavigate } from "react-router-dom";
import { Actividad } from "../../services/ActividadService";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaEdit, FaTrash } from "react-icons/fa";
import Swal from 'sweetalert2';

const ActividadCRUD: React.FC = () => {
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [procesos, setProcesos] = useState<Proceso[]>([]);
  const [newActividad, setNewActividad] = useState<Actividad>({ nombreActividad: "", idProceso: 0, criterio: "" });
  const [editingActividad, setEditingActividad] = useState<Actividad | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("token")) navigate("/login");
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      const [actividadesData, procesosData] = await Promise.all([getActividades(), getProcesos()]);
      setActividades(actividadesData);
      setProcesos(procesosData);
      setNewActividad({ ...newActividad, idProceso: procesosData[0]?.idProceso || 0 });
      setLoading(false);
    } catch (error) {
      console.error("Error al cargar datos:", error);
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const createdActividad = await createActividad(newActividad);
      setActividades([...actividades, createdActividad]);
      setNewActividad({ nombreActividad: "", criterio: "", idProceso: procesos[0]?.idProceso || 0 });
      setShowCreateModal(false);
    } catch (error) {
      console.error("Error al crear actividad:", error);
    }
  };

  const handleUpdate = async () => {
    if (!editingActividad) return;
    try {
      await updateActividad(editingActividad.idActividad!, editingActividad);
      setActividades(actividades.map((a) => (a.idActividad === editingActividad.idActividad ? editingActividad : a)));
      setEditingActividad(null);
      setShowEditModal(false);
    } catch (error) {
      console.error("Error al actualizar actividad:", error);
    }
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "¡No podrás revertir esto!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminarlo!',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await deleteActividad(id);
        setActividades(actividades.filter((a) => a.idActividad !== id));
        Swal.fire(
          'Eliminado!',
          'La actividad ha sido eliminada.',
          'success'
        );
      } catch (error) {
        console.error("Error al eliminar actividad:", error);
        Swal.fire(
          'Error!',
          'Hubo un problema al eliminar la actividad.',
          'error'
        );
      }
    }
  };

  if (loading) return <div className="text-center mt-5">Cargando...</div>;

  return (
    <div className="container mt-5">
      <h2 className="mb-4 text-center fw-bold" style={{ fontFamily: "Roboto", color: "#333" }}>
        Gestión de Actividades
      </h2>

      {/* Botón para abrir el modal de creación */}
      <div className="mb-4 text-end">
        <button className="btn " style={{color:'white',backgroundColor:'#800020'}} onClick={() => setShowCreateModal(true)}>
          Agregar Actividad
        </button>
      </div>

      {/* Tabla de actividades */}
      <div className="card shadow-sm border-0">
        <div className="card-header" style={{ backgroundColor: "#800020", color: "white" }}>
          <h5 className="card-title mb-0 fw-bold">Lista de Actividades</h5>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre de la Actividad</th>
                  <th>Criterio</th>
                  <th>Proceso</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {actividades.map((actividad) => (
                  <tr key={actividad.idActividad} className="actividad-row">
                    <td data-label="ID">{actividad.idActividad}</td>
                    <td data-label="Nombre de la Actividad">{actividad.nombreActividad}</td>
                    <td data-label="Criterio">{actividad.criterio}</td>
                    <td data-label="Proceso">{procesos.find((p) => p.idProceso === actividad.idProceso)?.nombreProceso || "Sin Proceso"}</td>
                    <td data-label="Acciones" className="d-flex justify-content-around">
                      <button
                        className="btn btn-warning btn-sm me-2"
                        onClick={() => {
                          setEditingActividad(actividad);
                          setShowEditModal(true);
                        }}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(actividad.idActividad!)}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal para agregar actividad */}
      {showCreateModal && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Agregar Nueva Actividad</h5>
                <button type="button" className="btn-close" onClick={() => setShowCreateModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label htmlFor="nombreActividad" className="form-label">Nombre de la Actividad</label>
                  <input
                    type="text"
                    className="form-control"
                    id="nombreActividad"
                    value={newActividad.nombreActividad}
                    onChange={(e) => setNewActividad({ ...newActividad, nombreActividad: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="criterio" className="form-label">Criterio</label>
                  <input
                    type="text"
                    className="form-control"
                    id="criterio"
                    value={newActividad.criterio}
                    onChange={(e) => setNewActividad({ ...newActividad, criterio: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="idProceso" className="form-label">Proceso</label>
                  <select
                    className="form-select"
                    id="idProceso"
                    value={newActividad.idProceso}
                    onChange={(e) => setNewActividad({ ...newActividad, idProceso: Number(e.target.value) })}
                    required
                  >
                    {procesos.map((proceso) => (
                      <option key={proceso.idProceso} value={proceso.idProceso}>
                        {proceso.nombreProceso}
                      </option>
                    ))}
                  </select>
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

      {/* Modal para editar actividad */}
      {showEditModal && editingActividad && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Editar Actividad</h5>
                <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label htmlFor="editNombreActividad" className="form-label">Nombre de la Actividad</label>
                  <input
                    type="text"
                    className="form-control"
                    id="editNombreActividad"
                    value={editingActividad.nombreActividad}
                    onChange={(e) => setEditingActividad({ ...editingActividad, nombreActividad: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="editCriterio" className="form-label">Criterio</label>
                  <input
                    type="text"
                    className="form-control"
                    id="editCriterio"
                    value={editingActividad.criterio}
                    onChange={(e) => setEditingActividad({ ...editingActividad, criterio: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="editIdProceso" className="form-label">Proceso</label>
                  <select
                    className="form-select"
                    id="editIdProceso"
                    value={editingActividad.idProceso}
                    onChange={(e) => setEditingActividad({ ...editingActividad, idProceso: Number(e.target.value) })}
                    required
                  >
                    {procesos.map((proceso) => (
                      <option key={proceso.idProceso} value={proceso.idProceso}>
                        {proceso.nombreProceso}
                      </option>
                    ))}
                  </select>
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

export default ActividadCRUD;