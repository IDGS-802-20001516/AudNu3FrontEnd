import React, { useEffect, useState } from "react";
import { Button, Form, Modal, Card } from "react-bootstrap";
import Table from 'react-bootstrap/Table';
import { getPlanesAuditoria, deletePlanAuditoria, getAuditorias, getActividades, getProcesos, getUsuario } from "../../services/PlanAuditoriaService";
import { PlanAuditoria } from "../../services/PlanAuditoriaService";
import PlanAuditoriaForm from "./PlanAuditoriaForm";
import "../../styles/cards.css";
import { FaEdit, FaTrash, FaPlus, FaEye } from "react-icons/fa"; // Agregamos FaEye
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';
import "../PlanAuditoria/planAud.css";
import HallazgoForm from "../Hallazgos/HallazgosForm";

const PlanAuditoriaList: React.FC = () => {
  const [planAuditorias, setPlanAuditoria] = useState<PlanAuditoria[]>([]);
  const [auditorias, setAuditoria] = useState<{ id_Auditoria: number; nombreAuditoria: string }[]>([]);
  const [actividades, setActividad] = useState<{ idActividad: number; nombreActividad: string; criterio: string }[]>([]);
  const [usuario, setUsuario] = useState<{ idUsuario: number; nombre: string }[]>([]);
  const [proceso, setProceso] = useState<{ idProceso: number; nombreProceso: string }[]>([]);
  const [filteredPlanes, setFilteredPlanes] = useState<PlanAuditoria[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<number | undefined>(undefined);
  const [selectedAuditoria, setSelectedAuditoria] = useState<number | "">("");
  const [showHallazgoModal, setShowHallazgoModal] = useState(false);
  const [selectedActividadId, setSelectedActividadId] = useState<number | undefined>(undefined);
  const [idAuditor, setIdAuditor] = useState<number | null>(null);
  const [userRole, setUserRole] = useState<number | null>(null);
  const [showCriterioModal, setShowCriterioModal] = useState(false); // Estado para el modal de criterio
  const [selectedCriterio, setSelectedCriterio] = useState<string>(""); // Estado para el criterio seleccionado

  useEffect(() => {
    fetchPlanes();
    fetchAuditorias();
    fetchActividades();
    fetchUsuarios();
    fetchProcesos();
  }, [userRole, idAuditor]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = JSON.parse(atob(token.split(".")[1]));
        const idAuditor = decodedToken.sub;
        const userRole = Number(decodedToken.sid);
        setUserRole(userRole);
        setIdAuditor(Number(idAuditor));
      } catch (error) {
        console.error("Error al decodificar el token:", error);
      }
    }
  }, []);

  useEffect(() => {
    if (selectedAuditoria === "") {
      setFilteredPlanes(planAuditorias);
    } else {
      const filtered = planAuditorias.filter((plan) => plan.id_Auditoria === selectedAuditoria);
      setFilteredPlanes(filtered);
    }
  }, [selectedAuditoria, planAuditorias]);

  const getNombreAuditorias = (id_Auditoria: number) => {
    const aud = auditorias.find((a) => a.id_Auditoria === id_Auditoria);
    return aud ? aud.nombreAuditoria : "Desconocido";
  };

  const getNombreActividades = (idActividad: number) => {
    const act = actividades.find((a) => a.idActividad === idActividad);
    return act ? act.nombreActividad : "Desconocido";
  };

  const getCriterioActividad = (idActividad: number) => {
    const act = actividades.find((a) => a.idActividad === idActividad);
    return act ? act.criterio : "Sin criterio";
  };

  const getNombreUsuario = (idUsuario: number) => {
    const user = usuario.find((c) => c.idUsuario === idUsuario);
    return user ? user.nombre : "Desconocido";
  };

  const getNombreProcesos = (idProceso: number) => {
    const pros = proceso.find((c) => c.idProceso === idProceso);
    return pros ? pros.nombreProceso : "Desconocido";
  };

  const fetchActividades = async () => {
    try {
      const data = await getActividades();
      setActividad(data);
    } catch (error) {
      console.error("Error al obtener las actividades:", error);
    }
  };

  const fetchAuditorias = async () => {
    try {
      const data = await getAuditorias();
      setAuditoria(data);
    } catch (error) {
      console.error("Error al obtener las auditorías:", error);
    }
  };

  const fetchPlanes = async () => {
    try {
      const data = await getPlanesAuditoria();
      if (userRole === 3) {
        const filtered = data.filter((plan) => plan.idAuditor === idAuditor);
        setPlanAuditoria(filtered);
        setFilteredPlanes(filtered);
      } else {
        setPlanAuditoria(data);
        setFilteredPlanes(data);
      }
    } catch (error) {
      console.error("Error al obtener los planes de auditoría:", error);
    }
  };

  const fetchUsuarios = async () => {
    try {
      const data = await getUsuario();
      setUsuario(data);
    } catch (error) {
      console.error("Error al obtener los usuarios:", error);
    }
  };

  const fetchProcesos = async () => {
    try {
      const data = await getProcesos();
      setProceso(data);
    } catch (error) {
      console.error("Error al obtener los procesos:", error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deletePlanAuditoria(id);
      const updatedPlanes = planAuditorias.map(plan =>
        plan.idPlanAuditoria === id ? { ...plan, estatus: false } : plan
      );
      setPlanAuditoria(updatedPlanes);
      setFilteredPlanes(updatedPlanes);
      Swal.fire("Éxito", "El plan de auditoría se ha desactivado correctamente", "success");
    } catch (error) {
      console.error("Error al eliminar el plan de auditoría:", error);
      Swal.fire("Error", "No se pudo desactivar el plan de auditoría", "error");
    }
  };

  const handleOpenModal = (id?: number) => {
    setSelectedPlanId(id);
    setShowModal(true);
  };

  const handleOpenHallazgoModal = (id: number, idActividad: number) => {
    setSelectedPlanId(id);
    setSelectedActividadId(idActividad);
    setShowHallazgoModal(true);
  };

  const handleOpenCriterioModal = (idActividad: number) => {
    const criterio = getCriterioActividad(idActividad);
    setSelectedCriterio(criterio);
    setShowCriterioModal(true);
  };

  const getSemaforoColor = (semaforo: string) => {
    switch (semaforo) {
      case "NCA": return "bg-dark text-white";
      case "NCM": return "bg-danger text-white";
      case "NCB": return "bg-warning text-dark";
      case "OM": return "bg-success text-white";
      case "C": return "bg-info text-white";
      case "N/A": return "text-black";
      default: return "bg-secondary text-white";
    }
  };

  return (
    <div className="container mt-5 animate__animated animate__fadeIn">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 style={{ 
          fontFamily: 'revert-layer', 
          color: "#800020", 
          fontWeight: "bold", 
          letterSpacing: "1px" 
        }}>
          Plan de Auditorias 
        </h2>
        <div className="d-flex gap-3">
          <Form.Select
            value={selectedAuditoria}
            onChange={(e) => setSelectedAuditoria(Number(e.target.value))}
            className="form-control w-50 border-primary shadow-sm"
          >
            <option value="">Seleccione una auditoría</option>
            {auditorias.map((aud) => (
              <option key={aud.id_Auditoria} value={aud.id_Auditoria}>
                {aud.nombreAuditoria}
              </option>
            ))}
          </Form.Select>
          <button
          onClick={() => handleOpenModal(undefined)} // Aseguramos que id sea undefined para nuevo registro
          className="btn btn-primary shadow-sm d-flex align-items-center"
          style={{ backgroundColor: "#800020", borderColor: "#800020" }}
          >
            <FaPlus className="me-2" /> Nueva Actividad
          </button>
        </div>
      </div>
      <div className="table-responsive shadow-sm rounded">
        <Table key={filteredPlanes.length} className="table table-striped table-hover shadow-sm">
          <thead className="table-danger">
            <tr>
              <th></th>
              <th>Auditoria</th>
              <th>Proceso</th>
              <th>Actividad</th>
              <th>Criterio</th> {/* Nueva columna para el ícono */}
              <th>Auditor</th>
              <th>Fecha de Inicio</th>
              <th>Fecha de Finalización</th>
              <th>Estado</th>
              <th>Semaforo</th>
              <th>Redacción</th>
              <th>Revisado</th>
              <th>Comentarios</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredPlanes
              .filter(plan => plan.estatus)
              .map((plan) => (
                <tr key={plan.idPlanAuditoria}>
                  <td>
                    {(userRole !== 5 || plan.idAuditor === idAuditor) && (
                      <Button
                        variant="outline-warning"
                        size="sm"
                        onClick={() => handleOpenHallazgoModal(plan.idPlanAuditoria, plan.idActividad)}
                      >
                        📋
                      </Button>
                    )}
                  </td>
                  <td>{getNombreAuditorias(plan.id_Auditoria)}</td>
                  <td>{getNombreProcesos(plan.idProceso)}</td>
                  <td>{getNombreActividades(plan.idActividad)}</td>
                  <td>
                    <Button
                      variant="outline-warning"
                      size="sm"
                      onClick={() => handleOpenCriterioModal(plan.idActividad)}
                    >
                      <FaEye />
                    </Button>
                  </td>
                  <td>{getNombreUsuario(plan.idAuditor)}</td>
                  <td>{new Date(plan.fechaInicio).toLocaleDateString()}</td>
                  <td>{plan.fechaFin ? new Date(plan.fechaFin).toLocaleDateString() : "Sin Fecha"}</td>
                    <td>
                    {plan.estado === "Listo" && (
                      <span className="badge bg-success">Listo</span>
                    )}
                    {plan.estado === "Pendiente" && (
                      <span className="badge bg-danger">Pendiente</span>
                    )}
                    {plan.estado === "En Proceso" && (
                      <span className="badge bg-warning text-dark">En Proceso</span>
                    )}
                    </td>
                  <td>
                    <span className={`badge ${getSemaforoColor(plan.semaforo)}`}>
                      {plan.semaforo}
                    </span>
                  </td>
                  <td>
                    {plan.redaccion ? (
                      <span className="badge bg-success">OK</span>
                    ) : (
                      <span className="badge bg-danger">NO</span>
                    )}
                  </td>
                  <td>
                    {plan.revisado ? (
                      <span className="badge bg-success">OK</span>
                    ) : (
                      <span className="badge bg-danger">NO</span>
                    )}
                  </td>
                  <td>{plan.comentarios}</td>
                  <td>
                    {(userRole !== 3 || plan.idAuditor === idAuditor) && (
                      <>
                        <Button
                          variant="outline-primary"
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => handleOpenModal(plan.idPlanAuditoria)}
                        >
                          <FaEdit className="me-1" />
                        </Button>
                        <Button
                          variant="outline-danger"
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => handleDelete(plan.idPlanAuditoria)}
                        >
                          <FaTrash className="me-1" />
                        </Button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </Table>
      </div>

      {showModal && (
        <PlanAuditoriaForm
          idPlanAuditoria={selectedPlanId}
          show={showModal}
          handleClose={() => setShowModal(false)}
          onPlanAuditoriaSaved={fetchPlanes}
        />
      )}
      {showHallazgoModal && (
        <HallazgoForm
          idPlanAuditoria={selectedPlanId}
          idActividad={selectedActividadId}
          show={showHallazgoModal}
          handleClose={() => setShowHallazgoModal(false)}
          onHallazgoSaved={fetchPlanes}
        />
      )}
      {showCriterioModal && (
        <Modal show={showCriterioModal} onHide={() => setShowCriterioModal(false)} centered>
          <Modal.Header closeButton style={{ backgroundColor: "#800020", color: "white" }}>
            <Modal.Title>Criterio de la Actividad</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Card className="shadow-sm" style={{ backgroundColor: "#f1f3f5", border: "1px solid #dee2e6" }}>
              <Card.Body>
                <Card.Text style={{
                  fontSize: "0.9rem",
                  color: "yellow",
                  backgroundColor: "black",
                  padding: "10px",
                  borderRadius: "5px",
                  minHeight: "60px",
                  boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
                  border: "1px solid #e9ecef"
                }}>
                  {selectedCriterio}
                </Card.Text>
              </Card.Body>
            </Card>
          </Modal.Body>
        </Modal>
      )}
    </div>
  );
};

export default PlanAuditoriaList;