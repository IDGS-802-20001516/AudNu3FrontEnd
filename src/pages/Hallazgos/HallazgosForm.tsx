import React, { useEffect, useState } from "react";
import { Modal, Form, Button, Row, Col } from "react-bootstrap";
import { getHallazgoById, createHallazgo, updateHallazgo } from "../../services/HallazgosService";
import { Hallazgo } from "../../services/HallazgosService";
import { getUsuario } from "../../services/HallazgosService";

interface HallazgoFormModalProps {
  idHallazgo?: number;
  idActividad?: number;
  userRole?: number;
  idPlanAuditoria?: number;
  idResponsable?: number;
  show: boolean;
  handleClose: () => void;
  onHallazgoSaved: () => void;
}

const HallazgoForm: React.FC<HallazgoFormModalProps> = ({
  idHallazgo,
  idActividad,
  idPlanAuditoria,
  idResponsable,
  show,
  handleClose,
  onHallazgoSaved,
  userRole, // Recibir el rol del usuario
}) => {
  const [hallazgo, setHallazgo] = useState<Hallazgo>({
    idHallazgo: 0,
    idPlanAuditoria: idPlanAuditoria || 0,
    idActividad: idActividad || 0,
    idResponsable: idResponsable || 0,
    montoImpacto: 0,
    semaforo: "",
    descripcion: "",
    riesgo: "",
    recomendaciones: "",
    planAccion: "",
    fechaCompromiso: "",
    cumplido: false,
    seguimiento: "",
  });

  const [usuarios, setUsuarios] = useState<{ idUsuario: number; nombreUsuario: string; idRol: number }[]>([]);
  const responsablesFiltrados = usuarios.filter(
    (usuario) => usuario.idRol === 4 || usuario.idRol === 5 
  );
  useEffect(() => {
    fetchUsuarios();
    if (idHallazgo) {
      fetchHallazgo(idHallazgo);
    } else {
      setHallazgo((prev) => ({ ...prev, idPlanAuditoria: idPlanAuditoria || 0, idActividad: idActividad || 0 }));
    }
  }, [idHallazgo, idPlanAuditoria, idActividad]);

  const fetchHallazgo = async (id: number) => {
    try {
      const data = await getHallazgoById(id);
      const fechaFormateada = data.fechaCompromiso ? data.fechaCompromiso.split("T")[0] : "";
      setHallazgo({ ...data, fechaCompromiso: fechaFormateada });
    } catch (error) {
      console.error("Error al obtener el hallazgo:", error);
    }
  };

  const fetchUsuarios = async () => {
    try {
      const data = await getUsuario();
      setUsuarios(data);
    } catch (error) {
      console.error("Error al obtener los usuarios:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const hallazgoParaEnviar = {
        ...hallazgo,
        montoImpacto: Number(hallazgo.montoImpacto),
        fechaCompromiso: hallazgo.fechaCompromiso || null,
        idActividad: hallazgo.idActividad || 0,
      };

      if (idHallazgo) {
        await updateHallazgo(idHallazgo, hallazgoParaEnviar);
      } else {
        await createHallazgo(hallazgoParaEnviar);
      }
      onHallazgoSaved();
      handleClose();
    } catch (error) {
      console.error("Error al guardar el hallazgo:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setHallazgo({ ...hallazgo, [name]: value });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setHallazgo({ ...hallazgo, [name]: checked });
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton  style={{ backgroundColor: "#800020", color: "white" }}>
        <Modal.Title className="fw-bold">
          {hallazgo.idHallazgo ? "Actualizar Hallazgo" : "Nuevo Hallazgo"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          {/* Campos ocultos para idPlanAuditoria e idActividad */}
          <input type="hidden" name="idPlanAuditoria" value={hallazgo.idPlanAuditoria} />
          <input type="hidden" name="idActividad" value={hallazgo.idActividad} />

          <Row>
            <Col md={6}>
              {/* Monto de Impacto (deshabilitado para rol 4) */}
              <Form.Group className="mb-3">
                <Form.Label>Monto de Impacto</Form.Label>
                <Form.Control
                  type="number"
                  name="montoImpacto"
                  value={hallazgo.montoImpacto}
                  onChange={handleChange}
                  required
                  disabled={userRole === 4} // Deshabilitado para rol 4
                  
                />
              </Form.Group>

              {/* Semáforo (deshabilitado para rol 4) */}
              <Form.Group className="mb-3">
                <Form.Label >Semáforo</Form.Label>
                <Form.Select
                  name="semaforo"
                  value={hallazgo.semaforo}
                  onChange={handleChange}
                  required
                  disabled={userRole === 4} // Deshabilitado para rol 4
                 
                >
                  <option value="">Seleccione un semáforo</option>
                  <option value="NCA">NCA (No Conformidad Alta)</option>
                  <option value="NCM">NCM (No Conformidad Media)</option>
                  <option value="NCB">NCB (No Conformidad Baja)</option>
                  <option value="C">C (Cumple)</option>
                  <option value="OM">OM (Oportunidad de Mejora)</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              {/* Fecha de Compromiso (deshabilitado para rol 4) */}
              <Form.Group className="mb-3">
                <Form.Label >Fecha de Compromiso</Form.Label>
                <Form.Control
                  type="date"
                  name="fechaCompromiso"
                  value={hallazgo.fechaCompromiso || ""}
                  onChange={handleChange}
                  disabled={userRole === 4} // Deshabilitado para rol 4
                  
                />
              </Form.Group>

              {/* Responsable (deshabilitado para rol 4) */}
              <Form.Group className="mb-3">
                <Form.Label >Responsable</Form.Label>
                <Form.Select
                  name="idResponsable"
                  value={hallazgo.idResponsable}
                  onChange={handleChange}
                  required
                  disabled={userRole === 4} // Deshabilitado para rol 4
                 
                >
                  <option value="">Seleccione un Responsable</option>
                  {responsablesFiltrados.map((usr) => (
                    <option key={usr.idUsuario} value={usr.idUsuario}>
                      {usr.nombreUsuario}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              {/* Cumplido (deshabilitado para rol 4) */}
              <Form.Group className="mb-3">
                <Form.Label >Cumplido</Form.Label>
                <Form.Check
                  type="checkbox"
                  name="cumplido"
                  checked={hallazgo.cumplido}
                  onChange={handleCheckboxChange}
                  disabled={userRole === 4} // Deshabilitado para rol 4
                  className="form-check-input"
                />
              </Form.Group>
            </Col>
          </Row>

          {/* Campos de texto grandes en dos columnas */}
          <Row>
            <Col md={6}>
              {/* Descripción (deshabilitado para rol 4) */}
              <Form.Group className="mb-3">
                <Form.Label>Descripción</Form.Label>
                <Form.Control
                  as="textarea"
                  name="descripcion"
                  value={hallazgo.descripcion}
                  onChange={handleChange}
                  required
                  disabled={userRole === 4} // Deshabilitado para rol 4
                  
                  style={{ height: "100px", resize: "none" }}
                />
              </Form.Group>

              {/* Riesgo (deshabilitado para rol 4) */}
              <Form.Group className="mb-3">
                <Form.Label >Riesgo</Form.Label>
                <Form.Control
                  as="textarea"
                  name="riesgo"
                  value={hallazgo.riesgo}
                  onChange={handleChange}
                  disabled={userRole === 4} // Deshabilitado para rol 4
                
                  style={{ height: "100px", resize: "none" }}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              {/* Recomendaciones (deshabilitado para rol 4) */}
              <Form.Group className="mb-3">
                <Form.Label >Recomendaciones</Form.Label>
                <Form.Control
                  as="textarea"
                  name="recomendaciones"
                  value={hallazgo.recomendaciones}
                  onChange={handleChange}
                  disabled={userRole === 4} // Deshabilitado para rol 4
                  
                  style={{ height: "100px", resize: "none" }}
                />
              </Form.Group>

              {/* Plan de Acción (deshabilitado para rol 4) */}
              <Form.Group className="mb-3">
                <Form.Label >Plan de Acción</Form.Label>
                <Form.Control
                  as="textarea"
                  name="planAccion"
                  value={hallazgo.planAccion}
                  onChange={handleChange}
                  disabled={userRole === 4} // Deshabilitado para rol 4
                  
                  style={{ height: "100px", resize: "none" }}
                />
              </Form.Group>
            </Col>
          </Row>

          {/* Seguimiento (habilitado solo para rol 4) */}
          <Form.Group className="mb-3">
            <Form.Label >Seguimiento</Form.Label>
            <Form.Control
              as="textarea"
              name="seguimiento"
              value={hallazgo.seguimiento}
              onChange={handleChange}
              disabled={userRole !== 4} // Habilitado solo para rol 4
              
              style={{ height: "100px", resize: "none" }}
            />
          </Form.Group>

          <div className="d-flex justify-content-between mt-4">
            <Button variant="outline-secondary" onClick={handleClose} className="px-4 rounded-3 shadow-sm">
              Cancelar
            </Button>
            <Button type="submit" variant="primary" className="px-4 rounded-3 shadow-sm">
              Guardar
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default HallazgoForm;