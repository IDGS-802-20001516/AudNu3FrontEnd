import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "../pages/Login/login";
import Dashboard from "../pages/Dashboard/dashboard";
import AuditoriaList from "../pages/Auditorias/AuditoriasList";
import EmpresaList from "../pages/Empresas/EmpresasList";
import EmpresaForm from "../pages/Empresas/EmpresasForm";
import UsuarioList from "../pages/Usuaro/usuarioList";
import PlanAuditoriaList from "../pages/PlanAuditoria/PlanAuditoriaList";
import HallazgosList from "../pages/Hallazgos/HallazgosList";
import WelcomePage from "../pages/Bienvenida/Bienvenida";
import PlanAuditoriaDashboard from "../pages/Dashboard/DashboardPlanAud";
import ActividadCRUD from "../pages/Proceso/ActividadCrud";
import ProcesoCRUD from "../pages/Proceso/ProcesoCrud";
const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login onLogin={(token: string) => { console.log(token); /* handle login */ }} />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/auditorias" element={<AuditoriaList />} />
        <Route path="/planaud" element={<PlanAuditoriaList />} />
        <Route path="/empresas" element={<EmpresaList />} />
        <Route path="/empresas/new" element={<EmpresaForm show={true} onHide={() => {}} />} />
        <Route path="/empresas/:id" element={<EmpresaForm show={true} onHide={() => {}} />} />
        <Route path="/usuarios" element={<UsuarioList />} />
        <Route path="/hallazgos" element={<HallazgosList />} />
        <Route path="/welcomeB" element={<WelcomePage />} />
        <Route path="/dashboardPA" element={<PlanAuditoriaDashboard />} />
        <Route path="/actividades" element={<ActividadCRUD />} />
        <Route path="/procesos" element={<ProcesoCRUD />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;