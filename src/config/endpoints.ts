import API_URL from "./api";

export const ENDPOINTS = {
  LOGIN: `${API_URL}/auth/login`,
  REGISTER: `${API_URL}/auth/register`,
  DASHBOARD: `${API_URL}/dashboard`,
  AUDITORIAS: `${API_URL}/Auditoria`,
  AUDITORIASID: `${API_URL}/Auditoria`,
  EMPRESAS: `${API_URL}/Empresas`,
  USUARIOS: `${API_URL}/Usuarios`,
  USUARIOSALL: `${API_URL}/Usuarios/all`,
  
  ROLES: `${API_URL}/Roles`,
  PLAN_AUDITORIA : `${API_URL}/PlanAuditoria`,
  PLAN_AUDITORIAALL : `${API_URL}/PlanAuditoria/all`,
  HALLAZGOS : `${API_URL}/hallazgos`,
  ACTIVIDAD : `${API_URL}/Actividades`,
  ACTIVIDADALL : `${API_URL}/Actividades/all`,
  HALLAZGOSVISTA : `${API_URL}/Hallazgos/vista`,
  CRITERIOS: `${API_URL}/Criterios`,
  PROCESOS: `${API_URL}/Procesos`,
  PROCESOSALL: `${API_URL}/Procesos/all`,
  AUDITORIASALL: `${API_URL}/Auditoria/all`,
  EMPRESASALL: `${API_URL}/Empresas/all`,
};
