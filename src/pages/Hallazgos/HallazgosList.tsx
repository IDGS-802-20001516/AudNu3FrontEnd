import React, { useEffect, useState } from "react";
import { Button, Collapse, Modal } from "react-bootstrap";
import {
  getHallazgos,
  deleteHallazgo,
  VistaHallazgo,
  getAuditorias,
  getArchivosSeguimiento,
  deleteArchivoSeguimiento,
  getArchivosAnexos,
  deleteArchivoAnexo,
} from "../../services/HallazgosService";
import HallazgoForm from "./HallazgosForm";
import { useNavigate } from "react-router-dom";
import "./HallazgosList.css";
import { Empresa, getEmpresasAll } from "../../services/EmpresaService";
import {
  FaEdit,
  FaTrash,
  FaEye,
  FaCheck,
  FaExclamation,
  FaChevronDown,
  FaChevronUp,
  FaFileAlt,
} from "react-icons/fa";
import Swal from "sweetalert2";
import { ENDPOINTS } from "../../config/endpoints";
import * as XLSX from "xlsx";

const ModalInformacionCompleta: React.FC<{
  descripcion: string;
  riesgo: string;
  recomendaciones: string;
  titulo: string;
  idHallazgo: number;
  userRole?: number;
}> = ({ descripcion, riesgo, recomendaciones, titulo, idHallazgo, userRole }) => {
  const [show, setShow] = useState(false);
  const [anexos, setAnexos] = useState<
    { idArchivo: number; rutaArchivo: string; nombreArchivo: string; tipoArchivo: string }[]
  >([]);
  const [previewData, setPreviewData] = useState<any[][] | null>(null);
  const [previewFileUrl, setPreviewFileUrl] = useState<string | null>(null);
  const [currentArchivoId, setCurrentArchivoId] = useState<number | null>(null);

  useEffect(() => {
    if (show) {
      const fetchAnexos = async () => {
        try {
          const data = await getArchivosAnexos(idHallazgo);
          setAnexos(data);
          if (data.length === 0) {
            Swal.fire({
              icon: 'info',
              title: 'Sin anexos',
              text: 'No hay anexos disponibles para este hallazgo',
              timer: 2000,
              showConfirmButton: false
            });
          }
        } catch (error) {
          console.error("Error al obtener anexos:", error);
          Swal.fire({
            icon: 'info',
            title: 'Sin anexos',
            text: 'No hay anexos disponibles para este hallazgo',
            timer: 2000,
            showConfirmButton: false
          });
        }
      };
      fetchAnexos();
    }
  }, [show, idHallazgo]);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handlePreview = async (idArchivo: number, tipoArchivo: string) => {
    const url = `${ENDPOINTS.HALLAZGOS}/${idHallazgo}/anexos/${idArchivo}/descargar`;
    setCurrentArchivoId(idArchivo);
    if (tipoArchivo.startsWith("image/")) {
      setPreviewFileUrl(url);
      setPreviewData(null);
    } else if (
      tipoArchivo === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      tipoArchivo === "application/vnd.ms-excel"
    ) {
      try {
        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        setPreviewData(jsonData as any[][]);
        setPreviewFileUrl(null);
      } catch (error) {
        Swal.fire("Error", "No se pudo cargar la vista previa del archivo Excel", "error");
      }
    } else {
      Swal.fire("Info", "La vista previa no está disponible para este tipo de archivo", "info");
    }
  };

  const handleDeleteAnexo = async (idArchivo: number) => {
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
        await deleteArchivoAnexo(idHallazgo, idArchivo);
        setAnexos(anexos.filter((anexo) => anexo.idArchivo !== idArchivo));
        Swal.fire("Éxito", "El anexo se ha eliminado correctamente", "success");
      } catch (error) {
        console.error("Error al eliminar el anexo:", error);
        Swal.fire("Error", "No se pudo eliminar el anexo", "error");
      }
    }
  };

  const handleClosePreview = () => {
    setPreviewFileUrl(null);
    setPreviewData(null);
    setCurrentArchivoId(null);
  };

  return (
    <>
      <button onClick={handleShow} className="btn btn-link p-0 text-primary fw-bold">
        <FaEye className="me-1" />
      </button>
      {show && (
        <div className="hallazgos-modal-container">
          <div className="modal fade show d-block" tabIndex={-1} role="dialog" style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}>
            <div className="modal-dialog modal-xl modal-dialog-centered" role="document">
              <div className="modal-content shadow-lg border-0 rounded-3">
                <div className="modal-header bg-gradient-primary text-white border-0 rounded-top-3">
                  <h4 className="modal-title font-weight-bold">{titulo}</h4>
                  <button type="button" className="btn-close btn-close-white" onClick={handleClose}></button>
                </div>
                <div className="modal-body p-4">
                  <div className="card mb-4 border-0 shadow-sm">
                    <div className="card-header bg-primary text-white rounded-top">
                      <h5 className="mb-0">Descripción</h5>
                    </div>
                    <div className="card-body p-3 bg-light">
                      <p className="text-muted lead" style={{ whiteSpace: "pre-wrap" }}>{descripcion}</p>
                      {anexos.length > 0 && (
                        <div className="mt-3">
                          <h6>Anexos:</h6>
                          <ul className="list-group">
                            {anexos.map((anexo) => (
                              <li
                                key={anexo.idArchivo}
                                className="list-group-item d-flex justify-content-between align-items-center"
                              >
                                <span>{anexo.nombreArchivo}</span>
                                <div>
                                  <Button
                                    variant="outline-primary"
                                    size="sm"
                                    className="me-2"
                                    onClick={() => handlePreview(anexo.idArchivo, anexo.tipoArchivo)}
                                  >
                                    <FaEye className="me-1" /> Ver
                                  </Button>
                                  {(userRole === 1 || userRole === 2) && (
                                    <Button
                                      variant="outline-danger"
                                      size="sm"
                                      onClick={() => handleDeleteAnexo(anexo.idArchivo)}
                                    >
                                      <FaTrash className="me-1" /> Eliminar 
                                    </Button>
                                  )}
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="card mb-4 border-0 shadow-sm">
                    <div className="card-header bg-danger text-white rounded-top">
                      <h5 className="mb-0">Riesgo</h5>
                    </div>
                    <div className="card-body p-3 bg-light">
                      <p className="text-warning lead" style={{ whiteSpace: "pre-wrap" }}>{riesgo}</p>
                    </div>
                  </div>
                  <div className="card mb-0 border-0 shadow-sm">
                    <div className="card-header bg-success text-white rounded-top">
                      <h5 className="mb-0">Recomendaciones</h5>
                    </div>
                    <div className="card-body p-3 bg-light">
                      <p className="text-success lead" style={{ whiteSpace: "pre-wrap" }}>{recomendaciones}</p>
                    </div>
                  </div>
                </div>
                <div className="modal-footer bg-light border-0 rounded-bottom-3">
                  <button type="button" className="btn btn-outline-secondary btn-lg" onClick={handleClose}>
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {(previewFileUrl || previewData) && (
        <Modal show={!!(previewFileUrl || previewData)} onHide={handleClosePreview} size="xl" centered>
          <Modal.Header closeButton>
            <Modal.Title>Vista Previa</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {previewFileUrl ? (
              <img
                src={previewFileUrl}
                alt="Preview"
                style={{ maxWidth: "100%", maxHeight: "500px", margin: "auto", display: "block" }}
              />
            ) : previewData ? (
              <div style={{ overflowX: "auto" }}>
                <table className="table table-bordered">
                  <tbody>
                    {previewData.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {row.map((cell, cellIndex) => (
                          <td key={cellIndex}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </Modal.Body>
          <Modal.Footer>
            {currentArchivoId && (
              <a
                className="btn btn-outline-primary"
                href={`${ENDPOINTS.HALLAZGOS}/${idHallazgo}/anexos/${currentArchivoId}/descargar`}
                download
              >
                Descargar
              </a>
            )}
            <Button variant="outline-secondary" onClick={handleClosePreview}>
              Cerrar
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </>
  );
};

const ModalSeguimiento: React.FC<{
  planAccion: string;
  seguimiento: string;
  titulo: string;
}> = ({ planAccion, seguimiento, titulo }) => {
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
          <div className="modal-backdrop fade show" style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}></div>
          <div className="modal fade show d-block" tabIndex={-1} role="dialog" style={{ zIndex: 1050 }}>
            <div className="modal-dialog modal-xl modal-dialog-centered" role="document">
              <div className="modal-content shadow-lg border-0 rounded-3">
                <div className="modal-header bg-gradient-success text-white border-0 rounded-top-3">
                  <h4 className="modal-title font-weight-bold">{titulo}</h4>
                  <button type="button" className="btn-close btn-close-white" onClick={handleClose}></button>
                </div>
                <div className="modal-body p-4">
                  <div className="card mb-4 border-0 shadow-sm">
                    <div className="card-header bg-primary text-white rounded-top">
                      <h5 className="mb-0">Plan de Acción</h5>
                    </div>
                    <div className="card-body p-3 bg-light">
                      <p className="text-muted lead" style={{ whiteSpace: "pre-wrap" }}>
                        {planAccion || "No hay plan de acción"}
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
                  <button type="button" className="btn btn-outline-success btn-lg" onClick={handleClose}>
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

const SeguimientoArchivosModal: React.FC<{
  idHallazgo: number;
  show: boolean;
  handleClose: () => void;
}> = ({ idHallazgo, show, handleClose }) => {
  const [archivos, setArchivos] = useState<
    { idArchivo: number; rutaArchivo: string; nombreArchivo: string; tipoArchivo: string }[]
  >([]);
  const [previewFile, setPreviewFile] = useState<string | null>(null);

  useEffect(() => {
    if (show) {
      const fetchArchivos = async () => {
        try {
          const data = await getArchivosSeguimiento(idHallazgo);
          setArchivos(data);
          if (data.length === 0) {
            Swal.fire({
              icon: 'info',
              title: 'Sin archivos',
              text: 'No hay archivos de seguimiento disponibles',
              timer: 2000,
              showConfirmButton: false
            });
          }
        } catch (error) {
          console.error("Error al obtener archivos:", error);
          Swal.fire({
            icon: 'info',
            title: 'Sin archivos',
            text: 'No hay archivos de seguimiento disponibles',
            timer: 2000,
            showConfirmButton: false
          });
        }
      };
      fetchArchivos();
    }
  }, [show, idHallazgo]);

  const handleDeleteArchivo = async (idArchivo: number) => {
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
        await deleteArchivoSeguimiento(idHallazgo, idArchivo);
        setArchivos(archivos.filter((archivo) => archivo.idArchivo !== idArchivo));
        Swal.fire("Éxito", "El archivo se ha eliminado correctamente", "success");
      } catch (error) {
        console.error("Error al eliminar el archivo:", error);
        Swal.fire("Error", "No se pudo eliminar el archivo", "error");
      }
    }
  };

  const handlePreview = (idArchivo: number, tipoArchivo: string) => {
    if (tipoArchivo.startsWith("image/") || tipoArchivo === "application/pdf") {
      setPreviewFile(`${ENDPOINTS.HALLAZGOS}/${idHallazgo}/archivos/${idArchivo}/descargar`);
    } else {
      Swal.fire("Info", "La vista previa no está disponible para este tipo de archivo", "info");
    }
  };

  const handleClosePreview = () => setPreviewFile(null);

  return (
    <>
      <Modal show={show} onHide={handleClose} size="lg" centered>
        <Modal.Header closeButton style={{ backgroundColor: "#28a745", color: "white" }}>
          <Modal.Title>Archivos de Seguimiento</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {archivos.length > 0 ? (
            <ul className="list-group">
              {archivos.map((archivo) => (
                <li
                  key={archivo.idArchivo}
                  className="list-group-item d-flex justify-content-between align-items-center"
                >
                  <span>{archivo.nombreArchivo}</span>
                  <div>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="me-2"
                      onClick={() => handlePreview(archivo.idArchivo, archivo.tipoArchivo)}
                    >
                      <FaEye className="me-1" /> Vista Previa
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDeleteArchivo(archivo.idArchivo)}
                    >
                      <FaTrash className="me-1" /> Eliminar
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No hay archivos de seguimiento subidos.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={handleClose}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>

      {previewFile && (
        <Modal show={!!previewFile} onHide={handleClosePreview} size="xl" centered>
          <Modal.Header closeButton>
            <Modal.Title>Vista Previa</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {previewFile.endsWith(".pdf") ? (
              <iframe
                src={previewFile}
                style={{ width: "100%", height: "500px" }}
                title="PDF Preview"
              />
            ) : (
              <img
                src={previewFile}
                alt="Preview"
                style={{ maxWidth: "100%", maxHeight: "500px", margin: "auto", display: "block" }}
              />
            )}
          </Modal.Body>
          <Modal.Footer>
            <a className="btn btn-outline-primary" href={previewFile} download>
              Descargar
            </a>
            <Button variant="outline-secondary" onClick={handleClosePreview}>
              Cerrar
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </>
  );
};

const HallazgoList: React.FC = () => {
  const [hallazgos, setHallazgos] = useState<VistaHallazgo[]>([]);
  const [auditorias, setAuditorias] = useState<
    { id_Auditoria: number; nombre_Auditoria: string; nombreAuditoria: string }[]
  >([]);
  const [selectedAuditoria, setSelectedAuditoria] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const [showSeguimientoArchivosModal, setShowSeguimientoArchivosModal] = useState(false);
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
      text: "No unavailable No podrás revertir esta acción",
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

  const handleOpenSeguimientoArchivosModal = (id: number) => {
    setSelectedHallazgoId(id);
    setShowSeguimientoArchivosModal(true);
  };

  const getEmpresaName = (idEmpresa: number) => {
    const empresa = empresas.find((e) => e.id_Empresas === idEmpresa);
    return empresa ? empresa.nombreEmpresa : "";
  };

  const getSemaforoColor = (semaforo: string) => {
    switch (semaforo) {
      case "NCA":
        return "bg-dark text-white";
      case "NCM":
        return "bg-danger text-white";
      case "NCB":
        return "bg-warning text-dark";
      case "OM":
        return "bg-success text-white";
      case "C":
        return "bg-primary text-white";
      default:
        return "bg-secondary text-white";
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
      <h2 style={{ fontFamily: "revert-layer", color: "#800020", fontWeight: "bold", letterSpacing: "1px" }}>
        Hallazgos
      </h2>
      <br />
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
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredHallazgos.map((h, index) => (
              <React.Fragment key={h.iD_Hallazgo ?? `fallback-${index}`}>
                <tr className="align-middle">
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
                    <Button variant="link" onClick={() => toggleRow(h.iD_Hallazgo ?? index)}>
                      {openRows.includes(h.iD_Hallazgo ?? index) ? <FaChevronUp /> : <FaChevronDown />}
                    </Button>
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      {userRole !== 5 && userRole !== 6 && (
                        <>
                          {userRole === 4 ? (
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => handleOpenModal(h.iD_Hallazgo)}
                            >
                              Editar Seguimiento
                            </Button>
                          ) : (
                            <>
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => handleOpenModal(h.iD_Hallazgo)}
                              >
                                <FaEdit className="me-1" />
                              </Button>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleDelete(h.iD_Hallazgo)}
                              >
                                <FaTrash className="me-1" />
                              </Button>
                            </>
                          )}
                        </>
                      )}
                      <Button
                        variant="outline-success"
                        size="sm"
                        onClick={() => handleOpenSeguimientoArchivosModal(h.iD_Hallazgo)}
                      >
                        <FaFileAlt className="me-1" /> Ver Seguimiento
                      </Button>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td colSpan={7}>
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
                                  idHallazgo={h.iD_Hallazgo}
                                  userRole={userRole ?? undefined}
                                />
                              )}
                            </span>
                          </div>
                          <div className="col-md-3 d-flex flex-column align-items-center text-center">
                            <strong>Plan de Acción y Seguimiento</strong>
                            <span className="mt-2">
                              {h.planAccion && (
                                <ModalSeguimiento
                                  planAccion={h.planAccion}
                                  seguimiento={h.seguimiento || ""}
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

      {showSeguimientoArchivosModal && selectedHallazgoId && (
        <SeguimientoArchivosModal
          idHallazgo={selectedHallazgoId}
          show={showSeguimientoArchivosModal}
          handleClose={() => setShowSeguimientoArchivosModal(false)}
        />
      )}
    </div>
  );
};

export default HallazgoList;