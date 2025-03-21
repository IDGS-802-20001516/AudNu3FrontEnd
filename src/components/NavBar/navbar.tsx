import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Logo from "../../assets/NU3B.png";
import { NavDropdown } from "react-bootstrap";
import "./navbar.css";
import "bootstrap/dist/css/bootstrap.min.css";

interface NavbarProps {
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onLogout }) => {
  const [userName, setUserName] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<number | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [timeoutId, setTimeoutId] = useState<number | null>(null); // Cambiado de NodeJS.Timeout a number

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = JSON.parse(atob(token.split(".")[1]));
        console.log("Decoded Token:", decodedToken);
        setUserName(decodedToken.name || "Usuario");
        setUserRole(Number(decodedToken.sid));
      } catch (error) {
        console.error("Error al decodificar el token:", error);
        setUserName("Usuario");
        setUserRole(null);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    onLogout();
    navigate("/login");
  };

  // Determinar el estilo de la navbar según el rol
  const getNavbarStyle = () => {
    if (userRole === 4 || userRole === 5) {
      return { background: "#007bff" }; // Azul para roles 4 y 5
    }
    return { background: "linear-gradient(to right, #800020, #a10a28)" }; 
  };

 
  const handleMouseEnter = (dropdown: string) => {
    if (timeoutId) {
      clearTimeout(timeoutId); 
    }
    const newTimeout = setTimeout(() => {
      setDropdownOpen(dropdown);
    }, 1000); 
    setTimeoutId(newTimeout);
  };

  const handleMouseLeave = () => {
    if (timeoutId) {
      clearTimeout(timeoutId); // Limpiar el timeout de apertura
    }
    const closeTimeout = setTimeout(() => {
      setDropdownOpen(null);
    }, 300); // Retraso de 300ms para cerrar
    setTimeoutId(closeTimeout);
  };

  const renderNavLinks = () => {
    if (userRole === 4 || userRole === 5) {
      return (
        <>
          <Link
            className={`nav-link text-light fw-medium ${
              location.pathname === "/hallazgos" ? "active" : ""
            }`}
            to="/hallazgos"
          >
            Hallazgos
          </Link>
          <Link
            className={`nav-link text-light fw-medium ${
              location.pathname === "/welcomeB" ? "active" : ""
            }`}
            to="/welcomeB"
          >
            Home
          </Link>
        </>
      );
    } else if (userRole === 1 || userRole === 2 || userRole === 3) {
      return (
        <>
          {/* Dropdown para Dashboards */}
          <NavDropdown
            title="Dashboards"
            id="dashboards-dropdown"
            className="text-light fw-medium dropdown-spacing"
            show={dropdownOpen === "dashboards"}
            onMouseEnter={() => handleMouseEnter("dashboards")}
            onMouseLeave={handleMouseLeave}
            onToggle={() => {}}
          >
            <NavDropdown.Item
              as={Link}
              to="/dashboard"
              className={location.pathname === "/dashboard" ? "active" : ""}
              style={{ backgroundColor: "#a10a28", color: "#fff" }}
            >
              Dashboard General
            </NavDropdown.Item>
            <NavDropdown.Item
              as={Link}
              to="/dashboardh"
              className={location.pathname === "/dashboardh" ? "active" : ""}
              style={{ backgroundColor: "#a10a28", color: "#fff" }}
            >
              Dashboard Hallazgos
            </NavDropdown.Item>
            <NavDropdown.Item
              as={Link}
              to="/dashboardPA"
              className={location.pathname === "/dashboardPA" ? "active" : ""}
              style={{ backgroundColor: "#a10a28", color: "#fff" }}
            >
              Dashboard Procesos
            </NavDropdown.Item>
          </NavDropdown>

          {/* Dropdown para Auditorías */}
          <NavDropdown
            title="Auditorías"
            id="auditorias-dropdown"
            className="text-light fw-medium dropdown-spacing"
            show={dropdownOpen === "auditorias"}
            onMouseEnter={() => handleMouseEnter("auditorias")}
            onMouseLeave={handleMouseLeave}
            onToggle={() => {}}
          >
            <NavDropdown.Item
              as={Link}
              to="/planaud"
              className={location.pathname === "/planaud" ? "active" : ""}
              style={{ backgroundColor: "#a10a28", color: "#fff" }}
            >
              Plan de Auditoría
            </NavDropdown.Item>
            <NavDropdown.Item
              as={Link}
              to="/hallazgos"
              className={location.pathname === "/hallazgos" ? "active" : ""}
              style={{ backgroundColor: "#a10a28", color: "#fff" }}
            >
              Hallazgos
            </NavDropdown.Item>
            <NavDropdown.Item
              as={Link}
              to="/auditorias"
              className={location.pathname === "/auditorias" ? "active" : ""}
              style={{ backgroundColor: "#a10a28", color: "#fff" }}
            >
              Auditorías
            </NavDropdown.Item>
          </NavDropdown>

          {/* Dropdown para Empresas y Usuarios */}
          <NavDropdown
            title="Empresas y Usuarios"
            id="empresas-usuarios-dropdown"
            className="text-light fw-medium dropdown-spacing"
            show={dropdownOpen === "empresasUsuarios"}
            onMouseEnter={() => handleMouseEnter("empresasUsuarios")}
            onMouseLeave={handleMouseLeave}
            onToggle={() => {}}
          >
            <NavDropdown.Item
              as={Link}
              to="/empresas"
              className={location.pathname === "/empresas" ? "active" : ""}
              style={{ backgroundColor: "#a10a28", color: "#fff" }}
            >
              Empresas
            </NavDropdown.Item>
            <NavDropdown.Item
              as={Link}
              to="/usuarios"
              className={location.pathname === "/usuarios" ? "active" : ""}
              style={{ backgroundColor: "#a10a28", color: "#fff" }}
            >
              Usuarios
            </NavDropdown.Item>
          </NavDropdown>

          {/* Dropdown para Gestión de Procesos */}
          <NavDropdown
            title="Gestión de Procesos"
            id="procesos-dropdown"
            className="text-light fw-medium dropdown-spacing"
            show={dropdownOpen === "gestionProcesos"}
            onMouseEnter={() => handleMouseEnter("gestionProcesos")}
            onMouseLeave={handleMouseLeave}
            onToggle={() => {}}
          >
            <NavDropdown.Item
              as={Link}
              to="/procesos"
              className={location.pathname === "/procesos" ? "active" : ""}
              style={{ backgroundColor: "#a10a28", color: "#fff" }}
            >
              Procesos
            </NavDropdown.Item>
            <NavDropdown.Item
              as={Link}
              to="/actividades"
              className={location.pathname === "/actividades" ? "active" : ""}
              style={{ backgroundColor: "#a10a28", color: "#fff" }}
            >
              Actividades
            </NavDropdown.Item>
          </NavDropdown>
        </>
      );
    }
    return null;
  };

  return (
    <nav
      className="navbar navbar-expand-lg navbar-dark shadow-sm py-2"
      style={getNavbarStyle()} // Aplicar el estilo dinámico
    >
      <div className="container-fluid">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <img
            src={Logo}
            alt="Logo"
            style={{ height: "40px", marginRight: "10px" }}
          />
          <span className="fw-bold fs-5" style={{ color: "#fff" }}>
            Auditoría Interna
          </span>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <div className="navbar-nav me-auto">{renderNavLinks()}</div>
          <div className="d-flex align-items-center">
            <span className="text-light me-3 fw-medium">👤 {userName}</span>
            <button
              className="btn btn-light btn-sm fw-medium shadow-sm"
              onClick={handleLogout}
              style={{ color: "#800020", backgroundColor: "#fff" }}
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;