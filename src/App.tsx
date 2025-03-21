import { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Navbar from "../src/components/NavBar/navbar";
import Login from "../src/pages/Login/login";
import Dashboard from "../src/pages/Dashboard/dashboard";
import Profile from "../src/pages/General/profile";
import Settings from "../src/pages/General/settings";
import "bootstrap/dist/css/bootstrap.min.css";
import AuditoriaList from "./pages/Auditorias/AuditoriasList";
import EmpresaList from "./pages/Empresas/EmpresasList";
import EmpresaForm from "./pages/Empresas/EmpresasForm";
import UsuarioList from "./pages/Usuaro/usuarioList";
import PlanAuditoriaList from "./pages/PlanAuditoria/PlanAuditoriaList";
import HallazgosList from "./pages/Hallazgos/HallazgosList";
import HallazgoDashboard from "./pages/Dashboard/dashboardH";
import WelcomePage from "./pages/Bienvenida/Bienvenida";
import PlanAuditoriaDashboard from "./pages/Dashboard/DashboardPlanAud";

import ActividadCRUD from "./pages/Proceso/ActividadCrud";
import ProcesoCRUD from "./pages/Proceso/ProcesoCrud";

// Componente para manejar la carga inicial y la redirección
const AppContent: React.FC<{
  isAuthenticated: boolean;
  userRole: number | null;
  handleLogin: (token: string) => void;
  handleLogout: () => void;
  loading: boolean;
}> = ({ isAuthenticated, userRole, handleLogin, handleLogout, loading }) => {
  // Determinar la ruta inicial después del login
  const getInitialRoute = () => {
    if (userRole === 4 || userRole === 5) {
      return "/welcomeB";
    }
    return "/Hallazgos";
  };

  // Redirigir según el estado de autenticación
  if (loading) {
    return <div>Cargando...</div>; // Mostrar un indicador de carga mientras se verifica el token
  }

  return (
    <>
      {isAuthenticated && <Navbar onLogout={handleLogout} />}
      <div className="container mt-4">
        <Routes>
          <Route
            path="/login"
            element={
              isAuthenticated ? <Navigate to={getInitialRoute()} /> : <Login onLogin={handleLogin} />
            }
          />
          <Route
            path="/"
            element={isAuthenticated ? <Navigate to={getInitialRoute()} /> : <Navigate to="/login" />}
          />
          <Route
            path="/dashboard"
            element={
              isAuthenticated && userRole !== 4 && userRole !== 5 ? (
                <Dashboard />
              ) : (
                <Navigate to={getInitialRoute()} />
              )
            }
          />
          <Route
            path="/dashboardPA"
            element={
              isAuthenticated && userRole !== 4 && userRole !== 5 ? (
                <PlanAuditoriaDashboard/>
              ) : (
                <Navigate to={getInitialRoute()} />
              )
            }
          />
          <Route
            path="/profile"
            element={
              isAuthenticated && userRole !== 4 && userRole !== 5 ? (
                <Profile />
              ) : (
                <Navigate to={getInitialRoute()} />
              )
            }
          />
          <Route
            path="/empresas/new"
            element={
              isAuthenticated && userRole !== 4 && userRole !== 5 ? (
                <EmpresaForm show={true} onHide={() => {}} />
              ) : (
                <Navigate to={getInitialRoute()} />
              )
            }
          />
          <Route
            path="/auditorias"
            element={
              isAuthenticated && userRole !== 4 && userRole !== 5 ? (
                <AuditoriaList />
              ) : (
                <Navigate to={getInitialRoute()} />
              )
            }
          />
          <Route
            path="/empresas/:id"
            element={
              isAuthenticated && userRole !== 4 && userRole !== 5 ? (
                <EmpresaForm show={true} onHide={() => {}} />
              ) : (
                <Navigate to={getInitialRoute()} />
              )
            }
          />
          <Route
            path="/welcomeB"
            element={isAuthenticated ? <WelcomePage /> : <Navigate to="/login" />}
          />
          <Route
            path="/empresas"
            element={
              isAuthenticated && userRole !== 4 && userRole !== 5 ? (
                <EmpresaList />
              ) : (
                <Navigate to={getInitialRoute()} />
              )
            }
          />
          <Route
            path="/settings"
            element={
              isAuthenticated && userRole !== 4 && userRole !== 5 ? (
                <Settings />
              ) : (
                <Navigate to={getInitialRoute()} />
              )
            }
          />
          <Route
            path="/usuarios"
            element={
              isAuthenticated && userRole !== 4 && userRole !== 5 ? (
                <UsuarioList />
              ) : (
                <Navigate to={getInitialRoute()} />
              )
            }
          />
          
          <Route
            path="/actividades"
            element={
              isAuthenticated && userRole !== 4 && userRole !== 5 ? (
                <ActividadCRUD />
              ) : (
                <Navigate to={getInitialRoute()} />
              )
            }
          />
          <Route
            path="/procesos"
            element={
              isAuthenticated && userRole !== 4 && userRole !== 5 ? (
                <ProcesoCRUD />
              ) : (
                <Navigate to={getInitialRoute()} />
              )
            }
          />
          <Route
            path="/planaud"
            element={
              isAuthenticated && userRole !== 4 && userRole !== 5 ? (
                <PlanAuditoriaList />
              ) : (
                <Navigate to={getInitialRoute()} />
              )
            }
          />
          <Route
            path="/hallazgos"
            element={isAuthenticated ? <HallazgosList /> : <Navigate to="/login" />}
          />
          <Route
            path="/dashboardh"
            element={
              isAuthenticated && userRole !== 4 && userRole !== 5 ? (
                <HallazgoDashboard />
              ) : (
                <Navigate to={getInitialRoute()} />
              )
            }
          />
        </Routes>
      </div>
    </>
  );
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Función para manejar el inicio de sesión
  const handleLogin = (token: string) => {
    localStorage.setItem("token", token);
    const decodedToken = JSON.parse(atob(token.split(".")[1]));
    setUserRole(Number(decodedToken.sid)); // Asume que el rol está en el campo "sid"
    setIsAuthenticated(true);
    setLoading(false); // Termina la carga después de iniciar sesión
  };

  // Función para manejar el cierre de sesión
  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setUserRole(null);
    setLoading(false);
  };

  // Verificar el token al cargar la página
  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const decodedToken = JSON.parse(atob(token.split(".")[1]));
          setUserRole(Number(decodedToken.sid));
          setIsAuthenticated(true); // Restaurar la autenticación si hay token
        } catch (error) {
          console.error("Error al decodificar el token:", error);
          localStorage.removeItem("token");
          setIsAuthenticated(false);
          setUserRole(null);
        }
      } else {
        setIsAuthenticated(false);
        setUserRole(null);
      }
      setLoading(false); // Termina la carga después de verificar el token
    };

    verifyToken();
  }, []);

  return (
    <Router>
      <AppContent
        isAuthenticated={isAuthenticated}
        userRole={userRole}
        handleLogin={handleLogin}
        handleLogout={handleLogout}
        loading={loading}
      />
    </Router>
  );
}

export default App;