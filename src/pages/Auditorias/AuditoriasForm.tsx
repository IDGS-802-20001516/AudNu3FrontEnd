import React from "react";
import { Auditoria } from "../../services/AuditoriaService";
import { Empresa } from "../../services/EmpresaService";
import { Usuario } from "../../services/UsuarioService";
import { Modal, Form, Button, Row, Col } from "react-bootstrap";
import "./auditoriaForm.css";
interface AuditoriaModalProps {
  show: boolean;
  onHide: () => void;
  auditoria: Auditoria;
  empresas: Empresa[];
  usuarios: Usuario[];
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  isEditing: boolean;
}

const formatDate = (dateString: string): string => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? "" : date.toISOString().split("T")[0];
};

const AuditoriaForm: React.FC<AuditoriaModalProps> = ({
  show,
  onHide,
  auditoria = {
    id_Auditoria: 0,
    nombreAuditoria: "",
    id_Empresa: 0,
    fechaInicio: "",
    fechaFinalizacion: "",
    auditorResponsable: "",
    nota: "",
    estado: "Pendiente",
  },
  empresas,
  usuarios,
  onChange,
  onSubmit,
  isEditing,
}) => {
  // Filtrar usuarios con roles 1, 2 y 3
  const auditoresFiltrados = usuarios.filter(
    (usuario) => usuario.idRol === 1 || usuario.idRol === 2 || usuario.idRol === 3
  );

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      centered
      dialogClassName="modal-dialog-scrollable"
      contentClassName="shadow-lg border-0 rounded-3"
    >
      <Modal.Header  className="bg-gradient-primary text-white border-0 rounded-top-3">
        <Modal.Title className="fw-bold">
          {isEditing ? "Editar Auditoría" : "Crear Auditoría"}
        </Modal.Title>
        <Button variant="close" className="btn-close-white" onClick={onHide} aria-label="Close" />
      </Modal.Header>
      <Modal.Body className="p-4" style={{ maxHeight: "70vh", overflowY: "auto" }}>
        <Form onSubmit={onSubmit}>
          <Row className="g-3">
            <Col md={6}>
              <Form.Group controlId="nombreAuditoria">
                <Form.Label className="fw-bold text-dark">Nombre de la Auditoría</Form.Label>
                <Form.Control
                  type="text"
                  name="nombreAuditoria"
                  value={auditoria.nombreAuditoria}
                  onChange={onChange}
                  required
                  className="form-control rounded-2"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="id_Empresa">
                <Form.Label className="fw-bold text-dark">Empresa Auditada</Form.Label>
                <Form.Select
                  name="id_Empresa"
                  value={auditoria.id_Empresa}
                  onChange={onChange}
                  required
                  className="form-select rounded-2"
                >
                  <option value="">Seleccione una empresa</option>
                  {empresas.map((empresa) => (
                    <option key={empresa.id_Empresas} value={empresa.id_Empresas}>
                      {empresa.nombreEmpresa}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="fechaInicio">
                <Form.Label className="fw-bold text-dark">Fecha de Inicio</Form.Label>
                <Form.Control
                  type="date"
                  name="fechaInicio"
                  value={formatDate(auditoria.fechaInicio)}
                  onChange={onChange}
                  required
                  className="form-control rounded-2"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="fechaFinalizacion">
                <Form.Label className="fw-bold text-dark">Fecha esperada de Finalización</Form.Label>
                <Form.Control
                  type="date"
                  name="fechaFinalizacion"
                  value={formatDate(auditoria.fechaFinalizacion)}
                  onChange={onChange}
                  required
                  className="form-control rounded-2"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="auditorResponsable">
                <Form.Label className="fw-bold text-dark">Auditor Responsable</Form.Label>
                <Form.Select
                  name="auditorResponsable"
                  value={auditoria.auditorResponsable}
                  onChange={onChange}
                  required
                  className="form-select rounded-2"
                >
                  <option value="">Seleccione un auditor</option>
                  {auditoresFiltrados.map((usuario) => (
                    <option key={usuario.idUsuario} value={usuario.nombre}>
                      {usuario.nombre}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="estado">
                <Form.Label className="fw-bold text-dark">Estado</Form.Label>
                <Form.Select
                  name="estado"
                  value={auditoria.estado}
                  onChange={onChange}
                  required
                  className="form-select rounded-2"
                >
                  <option value="Pendiente">Pendiente</option>
                  <option value="En Proceso">En Proceso</option>
                  <option value="Completada">Completada</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={12}>
              <Form.Group controlId="nota">
                <Form.Label className="fw-bold text-dark">Nota</Form.Label>
                <Form.Control
                  as="textarea"
                  name="nota"
                  value={auditoria.nota}
                  onChange={onChange}
                  rows={4}
                  className="form-control rounded-2"
                />
              </Form.Group>
            </Col>
          </Row>

          <div className="d-flex justify-content-end gap-3 mt-4">
            <Button variant="outline-secondary" onClick={onHide} className="px-4 py-2 rounded-3 shadow-sm">
              Cerrar
            </Button>
            <Button type="submit" variant="primary" className="px-4 py-2 rounded-3 shadow-sm">
              Guardar
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default AuditoriaForm;