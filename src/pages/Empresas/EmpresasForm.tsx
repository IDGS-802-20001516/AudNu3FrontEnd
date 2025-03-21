import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEmpresaById, createEmpresa, updateEmpresa } from '../../services/EmpresaService';
import { Empresa } from '../../services/EmpresaService';
import { Modal, Button, Form } from 'react-bootstrap';

interface EmpresaFormProps {
  show: boolean;
  onHide: () => void;
  id?: string;
  onSaveSuccess?: () => void;
}

const EmpresaForm: React.FC<EmpresaFormProps> = ({ show, onHide, id, onSaveSuccess }) => {
  const navigate = useNavigate();
  const initialEmpresaState: Empresa = {
    id_Empresas: 0,
    nombreEmpresa: '',
    imagenBase64: '',
  };

  const [empresa, setEmpresa] = useState<Empresa>(initialEmpresaState);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    if (show) {
      if (!id) {
        setEmpresa(initialEmpresaState); // Reiniciar para nuevo registro
      } else {
        fetchEmpresa(parseInt(id));
      }
    }
  }, [show, id]);

  const fetchEmpresa = async (id: number) => {
    try {
      const data = await getEmpresaById(id);
      setEmpresa(data);
    } catch (error) {
      console.error('Error al obtener la empresa:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEmpresa(prevState => ({ ...prevState, imagenBase64: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEmpresa(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const empresaData = {
        ...empresa,
        imagenBase64: empresa.imagenBase64 || undefined, // Enviar undefined si no hay imagen
      };

      console.log("Datos enviados al servidor:", empresaData); // Para depuración

      if (id) {
        await updateEmpresa(parseInt(id), empresaData);
      } else {
        await createEmpresa(empresaData);
      }
      onHide();
      if (onSaveSuccess) onSaveSuccess();
      navigate('/empresas');
    } catch (error) {
      console.error('Error al guardar la empresa:', error);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton style={{ backgroundColor: '#800020', color: 'white' }}>
        <Modal.Title>{id ? 'Editar Empresa' : 'Crear Empresa'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Nombre de la Empresa:</Form.Label>
            <Form.Control
              type="text"
              name="nombreEmpresa"
              value={empresa.nombreEmpresa}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Imagen de la Empresa:</Form.Label>
            <Form.Control
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
            {empresa.imagenBase64 && (
              <img
                src={empresa.imagenBase64}
                alt="Vista previa"
                className="mt-3 img-thumbnail"
                style={{ maxWidth: "200px" }}
              />
            )}
          </Form.Group>
          <Button variant="primary" type="submit">
            Guardar
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default EmpresaForm;