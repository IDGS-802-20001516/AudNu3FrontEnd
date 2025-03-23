import React, { useEffect } from "react";
import { Carousel, Container, Row, Col, Image } from "react-bootstrap";
import logo from "../../assets/nu3_logo.png"; 
import img1 from "../../assets/AUD2.png";
import img2 from "../../assets/AUD3.png"; 
import img3 from "../../assets/AUD1.png"; 
import { useNavigate } from 'react-router-dom';

const WelcomePage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login"); // Redirige al login si no hay token
    } else {
      // Decodifica el token para obtener el rol del usuario
      const decodedToken = JSON.parse(atob(token.split(".")[1]));
      const userRole = decodedToken.sid;

      // Redirige según el rol
      if (userRole === 4 || userRole === 5) {
        navigate("/hallazgos"); // Redirige a hallazgos para roles 4 y 5
      }
    }
  }, [navigate]);

  return (
    <div className="welcome-page">
      {/* Carrusel de imágenes */}
      <Carousel fade className="carousel-container">
        <Carousel.Item>
          <img
            className="d-block w-100 carousel-image"
            src={img3}
            alt="First slide"
            style={{ maxHeight: "400px", objectFit: "cover" }}
          />
          <Carousel.Caption>
            <h3>Auditoría Interna</h3>
            <p>Garantizamos la transparencia y eficiencia en tus procesos.</p>
          </Carousel.Caption>
        </Carousel.Item>
        <Carousel.Item>
          <img
            className="d-block w-100 carousel-image"
            src={img1}
            alt="Second slide"
            style={{ maxHeight: "400px", objectFit: "cover" }}
          />
          <Carousel.Caption>
            <h3>Mejora Continua</h3>
            <p>Identificamos oportunidades para optimizar tu negocio.</p>
          </Carousel.Caption>
        </Carousel.Item>
        <Carousel.Item>
          <img
            className="d-block w-100 carousel-image"
            src={img2}
            alt="Third slide"
            style={{ maxHeight: "400px", objectFit: "cover" }}
          />
          <Carousel.Caption>
            <h3>Cumplimiento Normativo</h3>
            <p>Aseguramos el cumplimiento de regulaciones y estándares.</p>
          </Carousel.Caption>
        </Carousel.Item>
      </Carousel>
    {/* Contenido principal */}
      <Container className="mt-5">
        <Row className="align-items-center">
          {/* Logo */}
          <Col md={4} className="text-center">
            <Image src={logo} alt="Logo de la empresa" fluid />
          </Col>

          {/* Texto llamativo */}
          <Col md={8}>
            <h1 className="display-4 fw-bold">Auditoría Interna</h1>
            <p className="lead">
              En un mundo empresarial en constante cambio, la **auditoría interna** es tu aliado estratégico para
              garantizar la integridad, eficiencia y cumplimiento de tus procesos. Nuestro equipo de expertos trabaja
              contigo para identificar riesgos, optimizar operaciones y asegurar el cumplimiento normativo.
            </p>
            <p className="text-muted">
              Con herramientas avanzadas y un enfoque proactivo, ayudamos a las empresas a alcanzar sus objetivos
              mientras minimizan riesgos y maximizan oportunidades.
            </p>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default WelcomePage;