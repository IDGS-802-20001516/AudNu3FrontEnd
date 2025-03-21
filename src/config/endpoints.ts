import API_URL from "./api";

export const ENDPOINTS = {
  LOGIN: `${API_URL}/auth/login`,
  REGISTER: `${API_URL}/auth/register`,
  DASHBOARD: `${API_URL}/dashboard`,
  AUDITORIAS: `${API_URL}/Auditoria`,
  AUDITORIASID: `${API_URL}/Auditoria`,
  EMPRESAS: `${API_URL}/Empresas`,
  USUARIOS: `${API_URL}/Usuarios`,
  ROLES: `${API_URL}/Roles`,
  PLAN_AUDITORIA : `${API_URL}/PlanAuditoria`,
  HALLAZGOS : `${API_URL}/hallazgos`,
  ACTIVIDAD : `${API_URL}/Actividades`,
  HALLAZGOSVISTA : `${API_URL}/Hallazgos/vista`,
  CRITERIOS: `${API_URL}/Criterios`,
  PROCESOS: `${API_URL}/Procesos`
};
