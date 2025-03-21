import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./navbar.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaHome, FaChartBar, FaClipboardList, FaBuilding, FaUsers, FaCogs, FaSignOutAlt, FaTachometerAlt, FaChartLine, FaSearch, FaThumbtack, FaUserCircle, FaListOl, FaLock, FaUnlock } from "react-icons/fa";
import Logo from "../../assets/NU3B.png";
interface NavbarProps {
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onLogout }) => {
  const [userName, setUserName] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<number | null>(null);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = JSON.parse(atob(token.split(".")[1]));
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

  const getNavbarStyle = () => {
    if (userRole === 4 || userRole === 5) {
      return { background: "linear-gradient(to right,rgb(230, 98, 131),rgb(139, 9, 9)" };
    }
    return { background: "linear-gradient(to right, #800020, #a10a28)" };
  };

  const renderNavLinks = () => {
    if (userRole === 4 || userRole === 5) {
      return (
        <>
          <Link
            className={`nav-link ${location.pathname === "/hallazgos" ? "active" : ""}`}
            to="/hallazgos"
          >
            <FaClipboardList className="nav-icon" />
            <span className="nav-text">Hallazgos</span>
            {location.pathname === "/hallazgos" && <span className="dot"></span>}
          </Link>
          <Link
            className={`nav-link ${location.pathname === "/welcomeB" ? "active" : ""}`}
            to="/welcomeB"
          >
            <FaHome className="nav-icon" />
            <span className="nav-text">Home</span>
            {location.pathname === "/welcomeB" && <span className="dot"></span>}
          </Link>
        </>
      );
    } else if (userRole === 1 || userRole === 2 || userRole === 3) {
      return (
        <>
          {/* Dashboards */}
          <Link
            to="/dashboard"
            className={`nav-link ${location.pathname === "/dashboard" ? "active" : ""}`}
          >
            <FaTachometerAlt className="nav-icon" />
            <span className="nav-text ">Dashboard General</span>
            {location.pathname === "/dashboard" && <span className="dot"></span>}
          </Link>
          <Link
            to="/dashboardh"
            className={`nav-link ${location.pathname === "/dashboardh" ? "active" : ""}`}
          >
            <FaChartLine className="nav-icon" />
            <span className="nav-text">Dashboard Hallazgos</span>
            {location.pathname === "/dashboardh" && <span className="dot"></span>}
          </Link>
          <Link
            to="/dashboardPA"
            className={`nav-link ${location.pathname === "/dashboardPA" ? "active" : ""}`}
          >
            <FaChartBar className="nav-icon" />
            <span className="nav-text">Dashboard Procesos</span>
            {location.pathname === "/dashboardPA" && <span className="dot"></span>}
          </Link>

          {/* Auditorías */}
          <Link
            to="/planaud"
            className={`nav-link ${location.pathname === "/planaud" ? "active" : ""}`}
          >
            <FaClipboardList className="nav-icon" />
            <span className="nav-text">Plan de Auditoría</span>
            {location.pathname === "/planaud" && <span className="dot"></span>}
          </Link>
          <Link
            to="/hallazgos"
            className={`nav-link ${location.pathname === "/hallazgos" ? "active" : ""}`}
          >
            <FaSearch className="nav-icon" />
            <span className="nav-text">Hallazgos</span>
            {location.pathname === "/hallazgos" && <span className="dot"></span>}
          </Link>
          <Link
            to="/auditorias"
            className={`nav-link ${location.pathname === "/auditorias" ? "active" : ""}`}
          >
            <FaThumbtack className="nav-icon" />
            <span className="nav-text">Auditorías</span>
            {location.pathname === "/auditorias" && <span className="dot"></span>}
          </Link>

          {/* Empresas y Usuarios */}
          <Link
            to="/empresas"
            className={`nav-link ${location.pathname === "/empresas" ? "active" : ""}`}
          >
            <FaBuilding className="nav-icon" />
            <span className="nav-text">Empresas</span>
            {location.pathname === "/empresas" && <span className="dot"></span>}
          </Link>
          <Link
            to="/usuarios"
            className={`nav-link ${location.pathname === "/usuarios" ? "active" : ""}`}
          >
            <FaUserCircle className="nav-icon" />
            <span className="nav-text">Usuarios</span>
            {location.pathname === "/usuarios" && <span className="dot"></span>}
          </Link>

          {/* Gestión de Procesos */}
          <Link
            to="/procesos"
            className={`nav-link ${location.pathname === "/procesos" ? "active" : ""}`}
          >
            <FaCogs className="nav-icon" />
            <span className="nav-text">Procesos</span>
            {location.pathname === "/procesos" && <span className="dot"></span>}
          </Link>
          <Link
            to="/actividades"
            className={`nav-link ${location.pathname === "/actividades" ? "active" : ""}`}
          >
            <FaListOl className="nav-icon" />
            <span className="nav-text">Actividades</span>
            {location.pathname === "/actividades" && <span className="dot"></span>}
          </Link>
        </>
      );
    }
    return null;
  };

  return (
    <>
      <button
        className="navbar-toggle-btn external-toggle"
        onClick={() => setIsNavOpen(!isNavOpen)}
      >
        ☰
      </button>

      <nav
        className={`sidebar-nav ${isNavOpen ? "open" : ""}`}
        style={getNavbarStyle()}
        onMouseEnter={() => !isPinned && setIsNavOpen(true)}
        onMouseLeave={() => !isPinned && setIsNavOpen(false)}
      >
        <div className="sidebar-header">
            <Link
            className="navbar-brand d-flex flex-column align-items-center text-center"
            to="/"
            onClick={() => setIsNavOpen(true)}
            >
            <img
              src={Logo}
              alt="NU3B"
              className="logo"
              style={{ maxHeight: "60px", marginBottom: "10px" ,marginTop: "30px"}}
            />
            <span className="brand-label">Auditoría Interna</span>
            </Link>
          <div className="header-buttons">
            <button
              className="navbar-pin-btn"
              onClick={() => setIsPinned(!isPinned)}
            >
              {isPinned ? <FaLock /> : <FaUnlock />}
            </button>
          </div>
        </div>

        <div className="sidebar-content">
          <div className="nav-links">{renderNavLinks()}</div>
          <div className="user-section">
            <span className="text-light fw-medium">
              <FaUsers className="nav-icon" />
              <span className="nav-text">{userName}</span>
            </span>
            <button
              className="nav-link logout-btn"
              onClick={handleLogout}
            >
              <FaSignOutAlt className="nav-icon" />
              <span className="nav-text">Cerrar sesión</span>
            </button>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;