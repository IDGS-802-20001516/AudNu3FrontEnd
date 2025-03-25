import React, { useEffect, useState } from "react";
import { Button, Collapse } from "react-bootstrap";
import { getHallazgos, deleteHallazgo, VistaHallazgo, getAuditorias } from "../../services/HallazgosService";
import HallazgoForm from "./HallazgosForm";
import { useNavigate } from "react-router-dom";
import "./HallazgosList.css";
import { Empresa, getEmpresasAll } from "../../services/EmpresaService";
import { FaEdit, FaTrash, FaEye, FaCheck, FaExclamation, FaChevronDown, FaChevronUp } from "react-icons/fa";
import Swal from 'sweetalert2';

// Componente para mostrar el texto completo en un modal
const ModalInformacionCompleta: React.FC<{
  descripcion: string;
  riesgo: string;
  recomendaciones: string;
  titulo: string;
}> = ({ descripcion, riesgo, recomendaciones, titulo }) => {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <>
      <button onClick={handleShow} className="btn btn-link p-0 text-primary fw-bold">
        <FaEye className="me-1" />
      </button>

      {show && (
        <div className="hallazgos-modal-container">
          <div
            className="modal fade show d-block"
            tabIndex={-1}
            role="dialog"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
          >
            <div className="modal-dialog modal-xl modal-dialog-centered" role="document">
              <div className="modal-content shadow-lg border-0 rounded-3">
                <div className="modal-header bg-gradient-primary text-white border-0 rounded-top-3">
                  <h4 className="modal-title font-weight-bold">{titulo}</h4>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={handleClose}
                    aria-label="Close"
                  ></button>
                </div>
                <div className="modal-body p-4">
                  <div className="card mb-4 border-0 shadow-sm">
                    <div className="card-header bg-primary text-white rounded-top">
                      <h5 className="mb-0">Descripción</h5>
                    </div>
                    <div className="card-body p-3 bg-light">
                      <p className="text-muted lead" style={{ whiteSpace: "pre-wrap" }}>
                        {descripcion}
                      </p>
                    </div>
                  </div>
                  <div className="card mb-4 border-0 shadow-sm">
                    <div className="card-header bg-danger text-white rounded-top">
                      <h5 className="mb-0">Riesgo</h5>
                    </div>
                    <div className="card-body p-3 bg-light">
                      <p className="text-warning lead" style={{ whiteSpace: "pre-wrap" }}>
                        {riesgo}
                      </p>
                    </div>
                  </div>
                  <div className="card mb-0 border-0 shadow-sm">
                    <div className="card-header bg-success text-white rounded-top">
                      <h5 className="mb-0">Recomendaciones</h5>
                    </div>
                    <div className="card-body p-3 bg-light">
                      <p className="text-success lead" style={{ whiteSpace: "pre-wrap" }}>
                        {recomendaciones}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="modal-footer bg-light border-0 rounded-bottom-3">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-lg"
                    onClick={handleClose}
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Componente para mostrar seguimiento y plan de acción en un modal
const ModalSeguimiento: React.FC<{
  seguimiento: string;
  planAccion: string;
  titulo: string;
}> = ({ seguimiento, planAccion, titulo }) => {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <>
      <button onClick={handleShow} className="btn btn-link p-0 text-success fw-bold">
        <FaEye className="me-1" />
      </button>

      {show && (
        <div className="hallazgos-modal-container">
          <div
            className="modal-backdrop fade show"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
          ></div>

          <div
            className="modal fade show d-block"
            tabIndex={-1}
            role="dialog"
            style={{ zIndex: 1050 }}
          >
            <div className="modal-dialog modal-xl modal-dialog-centered" role="document">
              <div className="modal-content shadow-lg border-0 rounded-3">
                <div className="modal-header bg-gradient-success text-white border-0 rounded-top-3">
                  <h4 className="modal-title font-weight-bold">{titulo}</h4>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={handleClose}
                    aria-label="Close"
                  ></button>
                </div>
                <div className="modal-body p-4">
                  <div className="card mb-4 border-0 shadow-sm">
                    <div className="card-header bg-primary text-white rounded-top">
                      <h5 className="mb-0">Plan de Acción</h5>
 maje                    </div>
                    <div className="card-body p-3 bg-light">
                      <p className="text-muted lead" style={{ whiteSpace: "pre-wrap" }}>
                        {planAccion}
                      </p>
                    </div>
                  </div>
                  <div className="card mb-0 border-0 shadow-sm">
                    <div className="card-header bg-success text-white rounded-top">
                      <h5 className="mb-0">Seguimiento</h5>
                    </div>
                    <div className="card-body p-3 bg-light">
                      <p className="text-success lead" style={{ whiteSpace: "pre-wrap" }}>
                        {seguimiento || "No hay seguimiento"}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="modal-footer bg-light border-0 rounded-bottom-3">
                  <button
                    type="button"
                    className="btn btn-outline-success btn-lg"
                    onClick={handleClose}
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const HallazgoList: React.FC = () => {
  const [hallazgos, setHallazgos] = useState<VistaHallazgo[]>([]);
  const [auditorias, setAuditorias] = useState<{ id_Auditoria: number; nombre_Auditoria: string; nombreAuditoria: string }[]>([]);
  const [selectedAuditoria, setSelectedAuditoria] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const [selectedHallazgoId, setSelectedHallazgoId] = useState<number | undefined>(undefined);
  const [userRole, setUserRole] = useState<number | null>(null);
  const [userTyP, setUserTyP] = useState<number | null>(null);
  const [openRows, setOpenRows] = useState<number[]>([]);
  const navigate = useNavigate();
  const [empresas, setEmpresas] = useState<Empresa[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    } else {
      try {
        const decodedToken = JSON.parse(atob(token.split(".")[1]));
        setUserRole(Number(decodedToken.sid));
        setUserTyP(Number(decodedToken.typ));
      } catch (error) {
        console.error("Error al decodificar el token:", error);
      }
    }
  }, [navigate]);

  useEffect(() => {
    fetchHallazgos();
    fetchAuditorias();
    fetchEmpresas();
  }, [userRole, userTyP]);

  const fetchHallazgos = async () => {
    try {
      const data = await getHallazgos();
      if (userRole === 4 || userRole === 5) {
        const filtered = data.filter((h) => h.idEmpresa === userTyP);
        setHallazgos(filtered);
      } else {
        setHallazgos(data);
      }
    } catch (error) {
      console.error("Error al obtener los hallazgos:", error);
    }
  };

  const fetchEmpresas = async () => {
    try {
      const data = await getEmpresasAll();
      setEmpresas(data);
    } catch (error) {
      console.error("Error al obtener las empresas:", error);
    }
  };

  const fetchAuditorias = async () => {
    try {
      const data = await getAuditorias();
      setAuditorias(data);
    } catch (error) {
      console.error("Error al obtener las auditorías:", error);
    }
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "No podrás revertir esta acción",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#800020",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        await deleteHallazgo(id);
        fetchHallazgos();
        Swal.fire("Éxito", "El hallazgo se ha eliminado correctamente", "success");
      } catch (error) {
        console.error("Error al eliminar el hallazgo:", error);
        Swal.fire("Error", "No se pudo eliminar el hallazgo", "error");
      }
    }
  };

  const handleOpenModal = (id?: number) => {
    setSelectedHallazgoId(id);
    setShowModal(true);
  };

  const getEmpresaName = (idEmpresa: number) => {
    const empresa = empresas.find((e) => e.id_Empresas === idEmpresa);
    return empresa ? empresa.nombreEmpresa : "";
  };

  const getSemaforoColor = (semaforo: string) => {
    switch (semaforo) {
      case "NCA": return "bg-dark text-white";
      case "NCM": return "bg-danger text-white";
      case "NCB": return "bg-warning text-dark";
      case "OM": return "bg-success text-white";
      case "C": return "bg-primary text-white";
      default: return "bg-secondary text-white";
    }
  };

  const toggleRow = (id: number) => {
    setOpenRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const filteredHallazgos = selectedAuditoria
    ? hallazgos.filter((h) => String(h.iD_Auditoria) === selectedAuditoria)
    : hallazgos;

  return (
    <div className="container mt-4">
      <h2 style={{ fontFamily: 'revert-layer', color: "#800020", fontWeight: "bold", letterSpacing: "1px" }}>
        Hallazgos
      </h2>
      <br />
      {/* Mostrar filtro solo para roles 1, 2 y 3 */}
      {[1, 2, 3].includes(userRole as number) && (
        <div className="d-flex justify-content-between mb-4">
          <select
            value={selectedAuditoria}
            onChange={(e) => setSelectedAuditoria(e.target.value)}
            className="form-select w-25 border-primary"
          >
            <option value="">Todas las auditorías</option>
            {auditorias.map((aud) => (
              <option key={aud.id_Auditoria} value={aud.id_Auditoria}>
                {aud.nombreAuditoria}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="table-responsive shadow-sm rounded">
        <table className="table table-striped table-hover shadow-sm">
          <thead className="table-danger">
            <tr>
              <th>Auditoria</th>
              <th>Empresa</th>
              <th>Proceso</th>
              <th>Actividad</th>
              <th>Cumplido</th>
              <th>Detalles</th>
            </tr>
          </thead>
          <tbody>
            {filteredHallazgos.map((h, index) => (
              <React.Fragment key={h.iD_Hallazgo ?? `fallback-${index}`}>
                <tr className="table-row align-middle">
                  <td>{h.nombre_Auditoria}</td>
                  <td>{getEmpresaName(h.idEmpresa)}</td>
                  <td>{h.nombre_Proceso}</td>
                  <td>{h.nombre_Actividad}</td>
                  <td>
                    {h.cumplido ? (
                      <span className="badge bg-success p-3" style={{ fontSize: "0.4rem" }}>
                        <FaCheck style={{ fontSize: "0.6rem" }} />
                      </span>
                    ) : (
                      <span className="badge bg-danger p-3" style={{ fontSize: "0.4rem" }}>
                        <FaExclamation style={{ fontSize: "0.6rem" }} />
                      </span>
                    )}
                  </td>
                  <td>
                    <Button
                      variant="link"
                      onClick={() => toggleRow(h.iD_Hallazgo ?? index)}
                    >
                      {openRows.includes(h.iD_Hallazgo ?? index) ? <FaChevronUp /> : <FaChevronDown />}
                    </Button>
                  </td>
                </tr>
                <tr>
                  <td colSpan={6}>
                    <Collapse in={openRows.includes(h.iD_Hallazgo ?? index)}>
                      <div className="p-3 bg-light border rounded">
                        <div className="row">
                          <div className="col-md-3 d-flex flex-column align-items-center text-center">
                            <strong>Monto Impacto</strong>
                            <span className="mt-2">
                              {h.montoImpacto.toLocaleString("es-MX", { style: "currency", currency: "MXN" })}
                            </span>
                          </div>
                          <div className="col-md-3 d-flex flex-column align-items-center text-center">
                            <strong>Semaforo</strong>
                            <span
                              className={`mt-2 badge ${getSemaforoColor(h.semaforo)} p-3`}
                              style={{
                                borderRadius: "50%",
                                fontWeight: "bold",
                                fontSize: "0.7rem",
                                width: "3rem",
                                height: "3rem",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              {h.semaforo}
                            </span>
                          </div>
                          <div className="col-md-3 d-flex flex-column align-items-center text-center">
                            <strong>Información Completa</strong>
                            <span className="mt-2">
                              {h.descripcion && (
                                <ModalInformacionCompleta
                                  descripcion={h.descripcion}
                                  riesgo={h.riesgo}
                                  recomendaciones={h.recomendaciones}
                                  titulo="Información Completa"
                                />
                              )}
                            </span>
                          </div>
                          <div className="col-md-3 d-flex flex-column align-items-center text-center">
                            <strong>Plan de Acción y Seguimiento</strong>
                            <span className="mt-2">
                              {h.planAccion && (
                                <ModalSeguimiento
                                  seguimiento={h.seguimiento || "No hay seguimiento"}
                                  planAccion={h.planAccion}
                                  titulo="Plan de Acción y Seguimiento"
                                />
                              )}
                            </span>
                          </div>
                        </div>
                        <div className="row mt-3">
                          <div className="col-md-4 d-flex flex-column align-items-center text-center">
                            <strong>Responsable</strong>
                            <span className="mt-2">{h.nombre_Responsable}</span>
                          </div>
                          <div className="col-md-4 d-flex flex-column align-items-center text-center">
                            <strong>Fecha de Compromiso</strong>
                            <span className="mt-2">{h.fechaCompromiso}</span>
                          </div>
                          <div className="col-md-4 d-flex flex-column align-items-center text-center">
                            {userRole !== 5 && userRole !== 6 && (
                              <>
                                <strong>Acciones</strong>
                                <div className="mt-2 d-flex gap-2">
                                  {userRole === 4 ? (
                                    <button
                                      onClick={() => handleOpenModal(h.iD_Hallazgo)}
                                      className="btn btn-outline-primary btn-sm"
                                    >
                                      Editar Seguimiento
                                    </button>
                                  ) : (
                                    <>
                                      <button
                                        onClick={() => handleOpenModal(h.iD_Hallazgo)}
                                        className="btn btn-outline-primary btn-sm"
                                      >
                                        <FaEdit className="me-1" />
                                      </button>
                                      <button
                                        onClick={() => handleDelete(h.iD_Hallazgo)}
                                        className="btn btn-outline-danger btn-sm"
                                      >
                                        <FaTrash className="me-1" />
                                      </button>
                                    </>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </Collapse>
                  </td>
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <HallazgoForm
          idHallazgo={selectedHallazgoId}
          show={showModal}
          handleClose={() => setShowModal(false)}
          onHallazgoSaved={fetchHallazgos}
          userRole={userRole ?? undefined}
        />
      )}
    </div>
  );
};

export default HallazgoList;