import React, { useEffect, useState } from "react";
import { getUsuarioById, createUsuario, updateUsuario, getEmpresas } from "../../services/UsuarioService";
import { getRoles } from "../../services/RolService";
import { Usuario } from "../../services/UsuarioService";
import { Rol } from "../../services/RolService";
import { Modal, Form, Button, Row, Col } from "react-bootstrap";

interface UsuarioFormModalProps {
  idUsuario?: number;
  show: boolean;
  handleClose: () => void;
  onUsuarioSaved: () => void;
}

const UsuarioForm: React.FC<UsuarioFormModalProps> = ({ idUsuario, show, handleClose, onUsuarioSaved }) => {
  const [usuario, setUsuario] = useState<Usuario>({
    idEmpresa: 0,
    idUsuario: 0,
    nombre: "",
    nombreUsuario: "",
    correo: "",
    contrasenia: "",
    idRol: 0,
    estatus: "",
    telefono: "",
    intentos: 0,
    token: "",
    fotoPerfil: "",
  });

  const [fotoPerfilFile, setFotoPerfilFile] = useState<File | undefined>(undefined);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [empresas, setEmpresas] = useState<{ id_Empresas: number; nombreEmpresa: string; imagenBase64?: string }[]>([]);
  const [isPasswordEditable, setIsPasswordEditable] = useState(false);

  useEffect(() => {
    fetchRoles();
    fetchEmpresas();
    if (idUsuario) {
      fetchUsuario(idUsuario);
    }
  }, [idUsuario]);

  const fetchUsuario = async (id: number) => {
    try {
      const data = await getUsuarioById(id);
      const { contrasenia, ...rest } = data;
      setUsuario({ ...rest, contrasenia: "" });
    } catch (error) {
      console.error("Error fetching usuario:", error);
    }
  };

  const fetchEmpresas = async () => {
    try {
      const data = await getEmpresas();
      setEmpresas(data);
    } catch (error) {
      console.error("Error fetching empresas:", error);
    }
  };

  const fetchRoles = async () => {
    try {
      const data = await getRoles();
      setRoles(data);
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!usuario.nombre.trim()) newErrors.nombre = "El nombre es obligatorio.";
    if (!usuario.nombreUsuario.trim()) newErrors.nombreUsuario = "El nombre de usuario es obligatorio.";
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!usuario.correo.trim()) newErrors.correo = "El correo es obligatorio.";
    else if (!emailRegex.test(usuario.correo)) newErrors.correo = "El correo no es válido.";

    if (!idUsuario && !usuario.contrasenia.trim()) {
      newErrors.contrasenia = "La contraseña es obligatoria.";
    } else if (usuario.contrasenia.trim() && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(usuario.contrasenia)) {
      newErrors.contrasenia = "Mínimo 8 caracteres, 1 mayúscula, 1 minúscula, 1 número y 1 especial.";
    }

    const phoneRegex = /^\d{10}$/;
    if (usuario.telefono && !phoneRegex.test(usuario.telefono)) 
      newErrors.telefono = "El teléfono debe tener 10 dígitos.";
    
    if (!usuario.idRol) newErrors.idRol = "El rol es obligatorio.";
    if (!usuario.idEmpresa) newErrors.idEmpresa = "La empresa es obligatoria.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const formData = new FormData();
    Object.keys(usuario).forEach((key) => {
      const value = usuario[key as keyof Usuario];
      if (key === "contrasenia" && (!value || (idUsuario && value === ""))) {
      } else {
        formData.append(key, value as string);
      }
    });

    if (fotoPerfilFile) {
      formData.append("fotoPerfil", fotoPerfilFile);
    }

    console.log("Datos enviados:", Object.fromEntries(formData));

    try {
      if (idUsuario) {
        await updateUsuario(idUsuario, usuario, fotoPerfilFile);
        console.log("Usuario actualizado exitosamente:", usuario);
      } else {
        await createUsuario(usuario, fotoPerfilFile);
        console.log("Usuario creado exitosamente:", usuario);
      }
      onUsuarioSaved();
      handleClose();
    } catch (error) {
      console.error("Error saving usuario:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUsuario({ ...usuario, [name]: value });
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFotoPerfilFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setUsuario({ ...usuario, fotoPerfil: reader.result as string });
      };
      reader.readAsDataURL(file);
      console.log("Archivo seleccionado:", file.name);
    }
  };

  const togglePasswordEditable = () => {
    setIsPasswordEditable(!isPasswordEditable);
    if (isPasswordEditable) {
      setUsuario({ ...usuario, contrasenia: "" });
      setErrors((prev) => ({ ...prev, contrasenia: "" }));
    }
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      size="lg"
      centered
      dialogClassName="modal-dialog-scrollable"
      contentClassName="shadow-lg border-0 rounded-3"
    >
      <Modal.Header className="bg-gradient-primary text-white border-0 rounded-top-3" style={{ backgroundColor: "#800020" }}>
        <Modal.Title className="fw-bold">
          {idUsuario ? "Editar Usuario" : "Crear Usuario"}
        </Modal.Title>
        <Button variant="close" className="btn-close-white" onClick={handleClose} aria-label="Close" />
      </Modal.Header>
      <Modal.Body className="p-4" style={{ maxHeight: "70vh", overflowY: "auto" }}>
        <Form onSubmit={handleSubmit}>
          <Row className="g-3">
            <Col md={6} className="text-center">
              <div className="mb-4">
                {usuario.fotoPerfil && (
                  <img
                    src={usuario.fotoPerfil}
                    alt="Perfil"
                    className="rounded-circle mb-3 shadow-sm"
                    style={{ width: "150px", height: "150px", objectFit: "cover" }}
                  />
                )}
                <Form.Control
                  type="file"
                  className="form-control rounded-2"
                  onChange={handleFileChange}
                />
              </div>
            </Col>
            <Col md={6}>
              <Row className="g-3">
                <Col md={12}>
                  <Form.Group controlId="nombre">
                    <Form.Label className="fw-bold text-dark">Nombre</Form.Label>
                    <Form.Control
                      type="text"
                      name="nombre"
                      value={usuario.nombre}
                      onChange={handleChange}
                      required
                      className={`form-control rounded-2 ${errors.nombre ? "is-invalid" : ""}`}
                    />
                    {errors.nombre && <div className="invalid-feedback">{errors.nombre}</div>}
                  </Form.Group>
                </Col>
                <Col md={12}>
                  <Form.Group controlId="nombreUsuario">
                    <Form.Label className="fw-bold text-dark">Usuario</Form.Label>
                    <Form.Control
                      type="text"
                      name="nombreUsuario"
                      value={usuario.nombreUsuario}
                      onChange={handleChange}
                      required
                      className={`form-control rounded-2 ${errors.nombreUsuario ? "is-invalid" : ""}`}
                    />
                    {errors.nombreUsuario && <div className="invalid-feedback">{errors.nombreUsuario}</div>}
                  </Form.Group>
                </Col>
                <Col md={12}>
                  <Form.Group controlId="correo">
                    <Form.Label className="fw-bold text-dark">Correo</Form.Label>
                    <Form.Control
                      type="email"
                      name="correo"
                      value={usuario.correo}
                      onChange={handleChange}
                      required
                      className={`form-control rounded-2 ${errors.correo ? "is-invalid" : ""}`}
                    />
                    {errors.correo && <div className="invalid-feedback">{errors.correo}</div>}
                  </Form.Group>
                </Col>
              </Row>
            </Col>
            <Col md={6}>
              <Form.Group controlId="contrasenia">
                <Form.Label className="fw-bold text-dark">
                  Contraseña {idUsuario ? "(Opcional)" : ""}
                </Form.Label>
                <div className="input-group">
                  <Form.Control
                    type="password"
                    name="contrasenia"
                    value={usuario.contrasenia}
                    onChange={handleChange}
                    disabled={!!idUsuario && !isPasswordEditable}
                    required={!idUsuario}
                    className={`form-control rounded-2 ${errors.contrasenia ? "is-invalid" : ""}`}
                  />
                  {idUsuario && (
                    <Button
                      variant={isPasswordEditable ? "secondary" : "outline-primary"}
                      onClick={togglePasswordEditable}
                      className="rounded-end-2"
                    >
                      {isPasswordEditable ? "Bloquear" : "Cambiar Contraseña"}
                    </Button>
                  )}
                </div>
                {errors.contrasenia && <div className="invalid-feedback">{errors.contrasenia}</div>}
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="telefono">
                <Form.Label className="fw-bold text-dark">Teléfono</Form.Label>
                <Form.Control
                  type="text"
                  name="telefono"
                  value={usuario.telefono}
                  onChange={handleChange}
                  className={`form-control rounded-2 ${errors.telefono ? "is-invalid" : ""}`}
                />
                {errors.telefono && <div className="invalid-feedback">{errors.telefono}</div>}
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="idRol">
                <Form.Label className="fw-bold text-dark">Rol</Form.Label>
                <Form.Select
                  name="idRol"
                  value={usuario.idRol ?? ""}
                  onChange={handleChange}
                  required
                  className={`form-select rounded-2 ${errors.idRol ? "is-invalid" : ""}`}
                >
                  <option value="">Seleccionar rol</option>
                  {roles.map((rol) => (
                    <option key={rol.idRol} value={rol.idRol}>
                      {rol.nombreRol}
                    </option>
                  ))}
                </Form.Select>
                {errors.idRol && <div className="invalid-feedback">{errors.idRol}</div>}
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="idEmpresa">
                <Form.Label className="fw-bold text-dark">Empresa</Form.Label>
                <Form.Select
                  name="idEmpresa"
                  value={usuario.idEmpresa ?? ""}
                  onChange={handleChange}
                  required
                  className={`form-select rounded-2 ${errors.idEmpresa ? "is-invalid" : ""}`}
                >
                  <option value="">Seleccionar empresa</option>
                  {empresas.map((empresa) => (
                    <option key={empresa.id_Empresas} value={empresa.id_Empresas}>
                      {empresa.nombreEmpresa}
                    </option>
                  ))}
                </Form.Select>
                {errors.idEmpresa && <div className="invalid-feedback">{errors.idEmpresa}</div>}
              </Form.Group>
            </Col>
          </Row>

          <div className="d-flex justify-content-end gap-3 mt-4">
            <Button variant="outline-secondary" onClick={handleClose} className="px-4 py-2 rounded-3 shadow-sm">
              Cancelar
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

export default UsuarioForm;