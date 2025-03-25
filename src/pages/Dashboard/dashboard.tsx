import React, { useEffect, useState, useMemo } from "react";
import { Pie, Bar } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from "chart.js";
import { getPlanesAuditoria } from "../../services/PlanAuditoriaService";
import { getProcesos } from "../../services/ProcesoService";
import { getUsuarios } from "../../services/UsuarioService";
import { getAuditorias } from "../../services/AuditoriaService";
import { PlanAuditoria } from "../../services/PlanAuditoriaService";
import { useNavigate } from 'react-router-dom';
import '../../styles/cards.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Registrar módulos de Chart.js
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const Dashboard: React.FC = () => {
  const [planAuditorias, setPlanAuditorias] = useState<PlanAuditoria[]>([]);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [auditorias, setAuditorias] = useState<any[]>([]);
  const [procesos, setProcesos] = useState<{ idProceso: number; nombreProceso: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAuditoria, setSelectedAuditoria] = useState<number>(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("token")) navigate("/login");
  }, [navigate]);

  useEffect(() => {
    setLoading(true);
    Promise.all([getPlanesAuditoria(), getUsuarios(), getAuditorias(), getProcesos()])
      .then(([planes, usuarios, auditorias, procesos]) => {
        const usuariosFiltrados = usuarios.filter(
          (usuario: any) => usuario.idRol === 2 || usuario.idRol === 3
        );
        setUsuarios(usuariosFiltrados);
        setAuditorias(auditorias);
        setProcesos(procesos.filter((proceso) => proceso.idProceso !== undefined) as { idProceso: number; nombreProceso: string }[]);

        const planesFiltrados = planes.filter((plan) =>
          usuariosFiltrados.some((usuario) => usuario.idUsuario === plan.idAuditor)
        );
        setPlanAuditorias(planesFiltrados);
      })
      .catch((error) => console.error("Error al cargar datos:", error))
      .finally(() => setLoading(false));
  }, []);

  const auditoriasUnicas = useMemo(() => {
    return auditorias.map((auditoria) => ({
      id: auditoria.id_Auditoria,
      nombre: auditoria.nombreAuditoria,
    }));
  }, [auditorias]);

  const actividadesFiltradas = useMemo(() => {
    return selectedAuditoria
      ? planAuditorias.filter((plan) => plan.id_Auditoria === selectedAuditoria)
      : planAuditorias;
  }, [planAuditorias, selectedAuditoria]);

  const preprocessedData = useMemo(() => {
    const estados = { Pendiente: 0, "En Proceso": 0, Listo: 0 };
    const auditorCount: Record<number, number> = {};

    actividadesFiltradas.forEach(plan => {
      estados[plan.estado as keyof typeof estados]++;
      if (!auditorCount[plan.idAuditor]) {
        auditorCount[plan.idAuditor] = 0;
      }
      auditorCount[plan.idAuditor]++;
    });

    return { estados, auditorCount };
  }, [actividadesFiltradas]);

  useEffect(() => {
    if (!loading && preprocessedData) {
      const pendientes = preprocessedData.estados.Pendiente;
      const auditoriaNombre = selectedAuditoria
        ? auditoriasUnicas.find(a => a.id === selectedAuditoria)?.nombre || "desconocida"
        : "todas las auditorías";
      if (pendientes > 0) {
        toast.warning(`Existen ${pendientes} actividades pendientes en ${auditoriaNombre}`, {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          toastId: "pendientes-toast",
          style: {
            background: "#800020",
            fontFamily: 'cursive', 
            color: "#fff",        // Color del texto blanco
          },
        });
      } else {
        toast.success(`No tienes actividades pendientes en ${auditoriaNombre}`, {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          toastId: "pendientes-toast",
          style: {
            background: "#00913f",
            fontFamily: 'cursive', 
            color: "#fff",        // Color del texto blanco
          },
        });
      }
    }
  }, [loading, preprocessedData, selectedAuditoria, auditoriasUnicas]);

  const usuariosOrdenados = useMemo(() => {
    return usuarios
      .filter((usuario) => usuario.idRol === 2 || usuario.idRol === 3)
      .map((usuario) => {
        const actividadesAuditor = actividadesFiltradas.filter(
          (plan) => plan.idAuditor === usuario.idUsuario
        );
        const pendientes = actividadesAuditor.filter(
          (plan) => plan.estado === "Pendiente"
        ).length;
        return { ...usuario, pendientes };
      })
      .sort((a, b) => b.pendientes - a.pendientes);
  }, [usuarios, actividadesFiltradas]);

  const generalChartData = useMemo(() => ({
    plugins: { legend: { display: false } },
    responsive: true,
    labels: ["Pendiente", "En Proceso", "Listo"],
    datasets: [{
      label: "Actividades Totales",
      data: Object.values(preprocessedData.estados),
      backgroundColor: ["#ff6961", "#FFC928", "#24CE6B"],
      borderColor: ["white", "white", "white"],
      borderWidth: 1,
    }],
  }), [preprocessedData]);

  const auditorActivitiesChartData = useMemo(() => {
    const colors = [
      "rgba(255, 99, 132, 0.6)",
      "rgba(54, 162, 235, 0.6)",
      "rgba(255, 206, 86, 0.6)",
      "rgba(75, 192, 192, 0.6)",
      "rgba(153, 102, 255, 0.6)",
      "rgba(255, 159, 64, 0.6)",
    ];

    // Filtrar usuarios con actividades mayores a 0
    const usuariosConActividades = usuariosOrdenados.filter(
      (usuario) => (preprocessedData.auditorCount[usuario.idUsuario] || 0) > 0
    );

    return {
      labels: usuariosConActividades.map((usuario) => usuario.nombre),
      datasets: [{
        label: "Actividades por Auditor",
        data: usuariosConActividades.map(usuario => preprocessedData.auditorCount[usuario.idUsuario] || 0),
        backgroundColor: usuariosConActividades.map((_, index) => colors[index % colors.length]),
        borderColor: usuariosConActividades.map((_, index) => colors[index % colors.length].replace("0.6", "1")),
        borderWidth: 1,
      }],
    };
  }, [preprocessedData, usuariosOrdenados]);

  const generateChartData = (idAuditor: number) => {
    const data = { Pendiente: 0, "En Proceso": 0, Listo: 0 };
    actividadesFiltradas.forEach(plan => {
      if (plan.idAuditor === idAuditor) {
        data[plan.estado as keyof typeof data]++;
      }
    });

    return {
      labels: ["Pendiente", "En Proceso", "Listo"],
      datasets: [{
        label: "Estado de Actividades",
        data: Object.values(data),
        backgroundColor: ["#ff6961", "#FFC928", "#24CE6B"],
        borderColor: ["white", "white", "white"],
        borderWidth: 1,
      }],
    };
  };

  const actividadesPorEstadoPorProceso = useMemo(() => {
    const estadoMap = new Map<string, Record<string, number>>();
    procesos.forEach((proc) => {
      estadoMap.set(proc.nombreProceso, { Pendiente: 0, Listo: 0, "En Proceso": 0 });
    });

    actividadesFiltradas.forEach((plan) => {
      const nombreProceso = procesos.find((p) => p.idProceso === plan.idProceso)?.nombreProceso || "Sin Proceso";
      if (!estadoMap.has(nombreProceso)) {
        estadoMap.set(nombreProceso, { Pendiente: 0, Listo: 0, "En Proceso": 0 });
      }
      const procesoData = estadoMap.get(nombreProceso)!;
      const estado = plan.estado?.toLowerCase() || "";
      if (estado === "pendiente") {
        procesoData.Pendiente = (procesoData.Pendiente || 0) + 1;
      } else if (estado === "listo") {
        procesoData.Listo = (procesoData.Listo || 0) + 1;
      } else if (estado === "en proceso") {
        procesoData["En Proceso"] = (procesoData["En Proceso"] || 0) + 1;
      }
    });

    return Array.from(estadoMap.entries()).map(([nombreProceso, counts]) => ({
      nombreProceso,
      Pendiente: counts.Pendiente,
      Listo: counts.Listo,
      "En Proceso": counts["En Proceso"],
    }));
  }, [actividadesFiltradas, procesos]);

  const estadoBarChartData = useMemo(() => {
    const labels = actividadesPorEstadoPorProceso.map((p) => p.nombreProceso);
    const datasets = [
      {
        label: "Pendiente",
        data: actividadesPorEstadoPorProceso.map((p) => p.Pendiente),
        backgroundColor: "#ff6384",
      },
      {
        label: "Listo",
        data: actividadesPorEstadoPorProceso.map((p) => p.Listo),
        backgroundColor: "#36a2eb",
      },
      {
        label: "En Proceso",
        data: actividadesPorEstadoPorProceso.map((p) => p["En Proceso"]),
        backgroundColor: "#ffce56",
      },
    ];

    return {
      labels,
      datasets,
    };
  }, [actividadesPorEstadoPorProceso]);

  return (
    <div className="container mt-5">
      <h2 className="mb-4 text-center fw-bold" style={{ fontFamily: "Roboto", color: "#333" }}>
        Dashboard de Actividades
      </h2>

      <ToastContainer />

      {loading ? (
        <div className="text-center mt-5">
          <p className="text-muted">Cargando datos...</p>
        </div>
      ) : (
        <>
          <div className="row mb-4">
            <div className="col-md-6 offset-md-3">
              <div className="card shadow-sm border-0" style={{ background: "#f8f9fa" }}>
                <div className="card-body">
                  <label htmlFor="auditoria" className="form-label fw-bold">
                    Seleccionar Auditoría:
                  </label>
                  <select
                    id="auditoria"
                    className="form-select"
                    value={selectedAuditoria}
                    onChange={(e) => setSelectedAuditoria(Number(e.target.value))}
                  >
                    <option value="">Todas las Auditorías</option>
                    {auditoriasUnicas.map((auditoria) => (
                      <option key={auditoria.id} value={auditoria.id}>
                        {auditoria.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="row mb-4">
            <div className="col-md-4">
              <div className="card text-white bg-danger mb-3 shadow-sm border-0">
                <div className="card-body text-center">
                  <h5 className="card-title fw-bold">Actividades Pendientes</h5>
                  <p className="card-text text-white display-4 fw-bold">{preprocessedData.estados.Pendiente}</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card text-white bg-warning mb-3 shadow-sm border-0">
                <div className="card-body text-center">
                  <h5 className="card-title fw-bold">Actividades en Proceso</h5>
                  <p className="card-text text-white display-4 fw-bold">{preprocessedData.estados["En Proceso"]}</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card text-white bg-success mb-3 shadow-sm border-0">
                <div className="card-body text-center">
                  <h5 className="card-title fw-bold">Actividades Listas</h5>
                  <p className="card-text text-white display-4 fw-bold">{preprocessedData.estados.Listo}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="row mb-4">
            <div className="col-md-6">
              <div className="card shadow-sm border-0" style={{ background: "#f8f9fa" }}>
                <div className="card-header" style={{ backgroundColor: "#800020", color: "white" }}>
                  <h5 className="card-title mb-0 fw-bold">Distribución General</h5>
                </div>
                <div className="card-body">
                  <Pie
                    data={generalChartData}
                    options={{
                      plugins: {
                        legend: { position: "bottom" },
                        datalabels: { display: false }, // Deshabilitar números en la gráfica
                      },
                      responsive: true,
                      maintainAspectRatio: false,
                    }}
                    height={200}
                  />
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card shadow-sm border-0" style={{ background: "#f8f9fa" }}>
                <div className="card-header" style={{ backgroundColor: "#800020", color: "white" }}>
                  <h5 className="card-title mb-0 fw-bold">Actividades por Auditor</h5>
                </div>
                <div className="card-body">
                  <Bar
                    data={auditorActivitiesChartData}
                    options={{
                      scales: {
                        y: { beginAtZero: true, title: { display: true, text: "Cantidad", font: { size: 14 } } },
                        x: { title: { display: true, text: "Auditores", font: { size: 14 } } },
                      },
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false, position: "top" },
                        tooltip: { enabled: true },
                      },
                    }}
                    height={200}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="row mb-4">
            <div className="col-12">
              <div className="card shadow-sm border-0" style={{ background: "#f8f9fa" }}>
                <div className="card-header" style={{ backgroundColor: "#800020", color: "white" }}>
                  <h5 className="card-title mb-0 fw-bold">Actividades por Estado por Proceso</h5>
                </div>
                <div className="card-body">
                  <Bar
                    data={estadoBarChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { position: "top", labels: { font: { size: 14 } } },
                        title: {
                          display: true,
                          text: "Cantidad de Actividades por Estado",
                          font: { size: 18, weight: "bold" },
                          color: "#333",
                        },
                      },
                      scales: {
                        x: { title: { display: true, text: "Procesos", font: { size: 14 } } },
                        y: { title: { display: true, text: "Cantidad", font: { size: 14 } }, beginAtZero: true },
                      },
                    }}
                    height={400}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            {usuariosOrdenados.map(usuario => {
              const actividadesAuditor = actividadesFiltradas.filter(plan => plan.idAuditor === usuario.idUsuario);
              const tieneActividades = actividadesAuditor.length > 0;

              return (
                <div key={usuario.idUsuario} className="col-md-4 mb-4">
                  <div className="card shadow-sm border-0" style={{ background: "#f8f9fa" }}>
                    <div className="card-header" style={{ backgroundColor: "#800020", color: "white" }}>
                      <img src={usuario.fotoPerfil} alt={usuario.nombreUsuario} className="rounded-circle me-2" style={{ width: "40px", height: "40px" }} />
                      <h5 className="card-title mb-0 fw-bold">{usuario.nombre}</h5>
                    </div>
                    <div className="card-body">
                      {tieneActividades ? (
                        <Pie
                          data={generateChartData(usuario.idUsuario)}
                          options={{
                            plugins: {
                              legend: { position: "bottom" },
                              datalabels: { display: false }, // Deshabilitar números en la gráfica
                            },
                            responsive: true,
                            maintainAspectRatio: false,
                          }}
                          height={150}
                        />
                      ) : (
                        <p className="text-center text-muted">No hay actividades para este auditor.</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;