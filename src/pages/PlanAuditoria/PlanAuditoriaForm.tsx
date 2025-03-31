import React, { useState, useEffect } from "react";
import { Modal, Form, Button, Row, Col, Card } from "react-bootstrap";
import { getProcesos, PlanAuditoria, getActividades, getAuditorias, createBulkPlanAuditoriaByProcess, createBulkPlanAuditoriaAllActivities } from "../../services/PlanAuditoriaService";
import { savePlanAuditoria, getPlanAuditoriaById } from "../../services/PlanAuditoriaService";
import { useNavigate } from "react-router-dom";
import { getUsuarios } from "../../services/UsuarioService";

interface PlanAuditoriaFormProps {
  idPlanAuditoria?: number;
  show: boolean;
  handleClose: () => void;
  onPlanAuditoriaSaved: () => void;
}

const PlanAuditoriaForm: React.FC<PlanAuditoriaFormProps> = ({ idPlanAuditoria, show, handleClose, onPlanAuditoriaSaved }) => {
  const [planAuditoria, setPlanAuditoria] = useState<PlanAuditoria>({
    idPlanAuditoria: 0,
    id_Auditoria: 0,
    idProceso: 0,
    idActividad: 0,
    idAuditor: 0,
    fechaInicio: "",
    fechaFin: null,
    estado: idPlanAuditoria ? "" : "Pendiente",
    semaforo: idPlanAuditoria ? "" : "",
    redaccion: false,
    revisado: false,
    comentarios: "",
    estatus: true,
  });

  const [isBulkByProcess, setIsBulkByProcess] = useState(false);
  const [isBulkAllActivities, setIsBulkAllActivities] = useState(false);
  const [auditorias, setAuditorias] = useState<{ id_Auditoria: number; nombreAuditoria: string }[]>([]);
  const [actividades, setActividades] = useState<{ idActividad: number; nombreActividad: string; criterio: string; idProceso: number }[]>([]);
  const [usuarios, setUsuarios] = useState<{ idUsuario: number; nombre: string; idRol: number }[]>([]);
  const [procesos, setProcesos] = useState<{ idProceso: number; nombreProceso: string }[]>([]);
  const [criterioActividad, setCriterioActividad] = useState<string>("");
  const navigate = useNavigate();

  const responsablesFiltrados = usuarios.filter(
    (usuario) => usuario.idRol === 1 || usuario.idRol === 2 || usuario.idRol === 3
  );

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    if (show) {
      if (!idPlanAuditoria) {
        setPlanAuditoria({
          idPlanAuditoria: 0,
          id_Auditoria: 0,
          idProceso: 0,
          idActividad: 0,
          idAuditor: 0,
          fechaInicio: "",
          fechaFin: "",
          estado: "Pendiente",
          semaforo: "",
          redaccion: false,
          revisado: false,
          comentarios: "",
          estatus: true,
        });
        setCriterioActividad("");
        setIsBulkByProcess(false);
        setIsBulkAllActivities(false);
      }
      fetchAuditorias();
      fetchActividades();
      fetchUsuarios();
      fetchProcesos();
      if (idPlanAuditoria) {
        fetchPlanAuditoria(idPlanAuditoria);
      }
    }
  }, [show, idPlanAuditoria]);

  const fetchAuditorias = async () => {
    try {
      const data = await getAuditorias();
      setAuditorias(data);
    } catch (error) {
      console.error("Error al obtener las auditorías:", error);
    }
  };

  const fetchActividades = async () => {
    try {
      const data = await getActividades();
      setActividades(data);
    } catch (error) {
      console.error("Error al obtener las actividades:", error);
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

  const fetchProcesos = async () => {
    try {
      const data = await getProcesos();
      setProcesos(data);
    } catch (error) {
      console.error("Error al obtener los procesos:", error);
    }
  };

  const fetchPlanAuditoria = async (id: number) => {
    try {
      const data = await getPlanAuditoriaById(id);
      setPlanAuditoria({
        ...data,
        fechaInicio: data.fechaInicio ? data.fechaInicio.split("T")[0] : "",
        fechaFin: data.fechaFin ? data.fechaFin.split("T")[0] : "",
      });
      const actividadSeleccionada = actividades.find(act => act.idActividad === data.idActividad);
      setCriterioActividad(actividadSeleccionada?.criterio || "");
    } catch (error) {
      console.error("Error al obtener el plan de auditoría:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;

    setPlanAuditoria(prev => ({
      ...prev,
      [name]: newValue,
    }));

    if (name === "idActividad" && !isBulkByProcess && !isBulkAllActivities) {
      const actividadSeleccionada = actividades.find(act => act.idActividad === Number(value));
      setCriterioActividad(actividadSeleccionada?.criterio || "");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    if (isBulkAllActivities) {
      await createBulkPlanAuditoriaAllActivities(Number(planAuditoria.id_Auditoria));
    } else if (isBulkByProcess) {
      await createBulkPlanAuditoriaByProcess(Number(planAuditoria.id_Auditoria), Number(planAuditoria.idProceso));
    } else {
      // Validar campos obligatorios
      if (!planAuditoria.id_Auditoria || !planAuditoria.idProceso || !planAuditoria.idActividad) {
        alert("Por favor, complete todos los campos obligatorios (Auditoría, Proceso, Actividad).");
        return;
      }

      const datosParaEnviar = {
        idPlanAuditoria: planAuditoria.idPlanAuditoria, // Include idPlanAuditoria
        id_Auditoria: Number(planAuditoria.id_Auditoria),
        idProceso: Number(planAuditoria.idProceso),
        idActividad: Number(planAuditoria.idActividad),
        idAuditor: planAuditoria.idAuditor ? Number(planAuditoria.idAuditor) : 0,
        fechaInicio: planAuditoria.fechaInicio && !isNaN(new Date(planAuditoria.fechaInicio).getTime()) 
          ? new Date(planAuditoria.fechaInicio).toISOString() 
          : "",
        fechaFin: planAuditoria.fechaFin && !isNaN(new Date(planAuditoria.fechaFin).getTime()) 
          ? new Date(planAuditoria.fechaFin).toISOString() 
          : null,
        estado: planAuditoria.estado || "Pendiente",
        semaforo: planAuditoria.semaforo || "",
        redaccion: planAuditoria.redaccion,
        revisado: planAuditoria.revisado,
        comentarios: planAuditoria.comentarios || "",
        estatus: true, // Siempre true al crear/editar
      };

      console.log("Datos enviados:", JSON.stringify(datosParaEnviar, null, 2)); // Para depuración
      await savePlanAuditoria(datosParaEnviar);
    }
    onPlanAuditoriaSaved();
    handleClose();
  } catch (error) {
    console.error("Error al guardar el plan de auditoría:", error);
  }
};

  const actividadesFiltradas = actividades.filter(
    (actividad) => actividad.idProceso === Number(planAuditoria.idProceso)
  );

  return (
    <Modal className="Modal" show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton style={{ backgroundColor: "#800020", color: "white" }}>
        <Modal.Title>
          {idPlanAuditoria
            ? "Actualizar Actividad de Auditoría"
            : isBulkAllActivities
            ? "Crear Planes para Todas las Actividades"
            : isBulkByProcess
            ? "Crear Planes por Proceso"
            : "Nueva Actividad de Auditoría"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          {!idPlanAuditoria && (
            <Row className="mb-3">
              <Col>
                <Form.Check
                  type="switch"
                  id="bulk-by-process-switch"
                  label="Crear todas las actividades de un proceso"
                  checked={isBulkByProcess}
                  onChange={(e) => {
                    setIsBulkByProcess(e.target.checked);
                    setIsBulkAllActivities(false);
                  }}
                />
                <Form.Check
                  type="switch"
                  id="bulk-all-activities-switch"
                  label="Crear todas las actividades de todos los procesos"
                  checked={isBulkAllActivities}
                  onChange={(e) => {
                    setIsBulkAllActivities(e.target.checked);
                    setIsBulkByProcess(false);
                  }}
                />
              </Col>
            </Row>
          )}
          <Row className="mb-2">
            <Col md={4}>
              <Form.Group controlId="id_Auditoria">
                <Form.Label>Auditoría</Form.Label>
                <Form.Control
                  as="select"
                  name="id_Auditoria"
                  value={planAuditoria.id_Auditoria}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccione una auditoría</option>
                  {auditorias.map((aud) => (
                    <option key={aud.id_Auditoria} value={aud.id_Auditoria}>
                      {aud.nombreAuditoria}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
            </Col>
            {(!isBulkAllActivities || idPlanAuditoria) && (
              <Col md={4}>
                <Form.Group controlId="idProceso">
                  <Form.Label>Proceso</Form.Label>
                  <Form.Control
                    as="select"
                    name="idProceso"
                    value={planAuditoria.idProceso}
                    onChange={handleChange}
                    required={isBulkByProcess || (!isBulkAllActivities && !idPlanAuditoria)}
                    disabled={isBulkAllActivities || !!idPlanAuditoria}
                  >
                    <option value="">Seleccione un Proceso</option>
                    {procesos.map((pros) => (
                      <option key={pros.idProceso} value={pros.idProceso}>
                        {pros.nombreProceso}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>
              </Col>
            )}
            {(!isBulkByProcess && !isBulkAllActivities) && (
              <Col md={4}>
                <Form.Group controlId="idActividad">
                  <Form.Label>Actividad</Form.Label>
                  <Form.Control
                    as="select"
                    name="idActividad"
                    value={planAuditoria.idActividad}
                    onChange={handleChange}
                    required={!idPlanAuditoria}
                    disabled={planAuditoria.idProceso === 0 || !!idPlanAuditoria}
                  >
                    <option value="">Seleccione una actividad</option>
                    {actividadesFiltradas.map((act) => (
                      <option key={act.idActividad} value={act.idActividad}>
                        {act.nombreActividad}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>
              </Col>
            )}
          </Row>
          {(!isBulkByProcess && !isBulkAllActivities) && criterioActividad && (
            <Row className="mb-2">
              <Col md={12}>
                <Card className="shadow-sm" style={{ backgroundColor: "#f1f3f5", border: "1px solid #dee2e6" }}>
                  <Card.Body>
                    <Card.Title style={{ 
                      fontSize: "1rem", 
                      textAlign: "center",
                      color: "#ffffff", 
                      backgroundColor: "#800020", 
                      padding: "5px 10px", 
                      borderRadius: "5px 5px 0 0",
                      margin: "-1.25rem -1.25rem 10px -1.25rem"
                    }}>
                      Criterio de la Actividad
                    </Card.Title>
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
                      {criterioActividad}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}
          {(!isBulkByProcess && !isBulkAllActivities) && (
            <>
              <Row className="mb-2">
                <Col md={3}>
                  <Form.Group controlId="fechaInicio">
                    <Form.Label>Fecha de Inicio</Form.Label>
                    <Form.Control
                      type="date"
                      name="fechaInicio"
                      value={planAuditoria.fechaInicio}
                      onChange={handleChange}
                      required={!idPlanAuditoria}
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group controlId="fechaFin">
                    <Form.Label>Fecha de Finalización</Form.Label>
                    <Form.Control
                      type="date"
                      name="fechaFin"
                      value={planAuditoria.fechaFin || ""}
                      onChange={handleChange}
                      disabled={idPlanAuditoria ? false : true} // Habilitado solo en edición
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="idAuditor">
                    <Form.Label>Auditor</Form.Label>
                    <Form.Control
                      as="select"
                      name="idAuditor"
                      value={planAuditoria.idAuditor}
                      onChange={handleChange}
                      required={!idPlanAuditoria}
                    >
                      <option value="">Seleccione un auditor</option>
                      {responsablesFiltrados.map((usr) => (
                        <option key={usr.idUsuario} value={usr.idUsuario}>
                          {usr.nombre}
                        </option>
                      ))}
                    </Form.Control>
                  </Form.Group>
                </Col>
              </Row>
              <Row className="mb-2">
                <Col md={4}>
                  <Form.Group controlId="estado">
                    <Form.Label>Estado</Form.Label>
                    <Form.Control
                      as="select"
                      name="estado"
                      value={planAuditoria.estado}
                      onChange={handleChange}
                      disabled={!idPlanAuditoria} // Habilitado solo en edición
                    >
                      <option value="">Seleccione un estado</option>
                      <option value="Pendiente">Pendiente</option>
                      <option value="En Proceso">En Proceso</option>
                      <option value="Listo">Listo</option>
                    </Form.Control>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group controlId="semaforo">
                    <Form.Label>Semáforo</Form.Label>
                    <Form.Control
                      as="select"
                      name="semaforo"
                      value={planAuditoria.semaforo}
                      onChange={handleChange}
                      disabled={!idPlanAuditoria} // Habilitado solo en edición
                    >
                      <option value="">Seleccione un semáforo</option>
                      <option value="NCA">NCA</option>
                      <option value="NCM">NCM</option>
                      <option value="NCB">NCB</option>
                      <option value="OM">OM</option>
                      <option value="C">C</option>
                      <option value="N/A">N/A</option>
                    </Form.Control>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group controlId="redaccion">
                    <Form.Check
                      type="checkbox"
                      name="redaccion"
                      label="Redacción"
                      checked={planAuditoria.redaccion}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group controlId="comentarios">
                    <Form.Label>Comentarios</Form.Label>
                    <Form.Control
                      as="textarea"
                      name="comentarios"
                      value={planAuditoria.comentarios}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="revisado">
                    <Form.Check
                      type="checkbox"
                      name="revisado"
                      label="Revisado"
                      checked={planAuditoria.revisado}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </>
          )}
          <Button variant="primary" type="submit">
            {isBulkAllActivities ? "Crear Todas" : isBulkByProcess ? "Crear por Proceso" : "Guardar"}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default PlanAuditoriaForm;