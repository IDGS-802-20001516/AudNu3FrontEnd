import React, { useEffect, useState, useMemo } from "react";
import { getHallazgos, VistaHallazgo } from "../../services/HallazgosService";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import "../../styles/cards.css";
import { useNavigate } from "react-router-dom";

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const HallazgoDashboard: React.FC = () => {
  const [hallazgos, setHallazgos] = useState<VistaHallazgo[]>([]);
  const [auditorias, setAuditorias] = useState<string[]>([]);
  const [selectedAuditoria, setSelectedAuditoria] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    fetchHallazgos();
  }, []);

  const fetchHallazgos = async () => {
    try {
      const data = await getHallazgos();
      console.log("Datos de hallazgos:", data);
      setHallazgos(data);

      // Obtener lista única de auditorías
      const auditoriasUnicas = Array.from(new Set(data.map((h) => h.nombre_Auditoria)));
      setAuditorias(auditoriasUnicas);
      if (auditoriasUnicas.length > 0) {
        setSelectedAuditoria(auditoriasUnicas[0]);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error al obtener los hallazgos:", error);
      setLoading(false);
    }
  };

  // Filtrar hallazgos por auditoría seleccionada
  const hallazgosFiltrados = useMemo(() => {
    return selectedAuditoria
      ? hallazgos.filter((h) => h.nombre_Auditoria === selectedAuditoria)
      : hallazgos;
  }, [hallazgos, selectedAuditoria]);

  // Calcular métricas
  const totalImpacto = useMemo(() => {
    return hallazgosFiltrados.reduce((sum, h) => sum + (h.montoImpacto || 0), 0);
  }, [hallazgosFiltrados]);

  const hallazgosCumplidos = useMemo(() => {
    return hallazgosFiltrados.filter((h) => h.cumplido).length;
  }, [hallazgosFiltrados]);

  const hallazgosPendientes = useMemo(() => {
    return hallazgosFiltrados.filter((h) => !h.cumplido).length;
  }, [hallazgosFiltrados]);

  // Calcular hallazgos por semáforo (solo NCA, NCM, NCB)
  const hallazgosPorSemaforo = useMemo(() => {
    const semaforos = ["NCA", "NCM", "NCB"];
    const semaforoMap: Record<string, number> = {};

    semaforos.forEach((semaforo) => {
      semaforoMap[semaforo] = hallazgosFiltrados
        .filter((h) => h.semaforo === semaforo)
        .length;
    });

    return semaforoMap;
  }, [hallazgosFiltrados]);

  // Calcular monto de impacto por tipo de semáforo (incluye todos los semáforos)
  const impactoPorSemaforo = useMemo(() => {
    const semaforos = ["NCA", "NCM", "NCB"];
    const impactoMap: Record<string, number> = {};

    semaforos.forEach((semaforo) => {
      impactoMap[semaforo] = hallazgosFiltrados
        .filter((h) => h.semaforo === semaforo)
        .reduce((sum, h) => sum + (h.montoImpacto || 0), 0);
    });

    return impactoMap;
  }, [hallazgosFiltrados]);

  // Calcular monto de impacto por auditoría
  const impactoPorAuditoria = useMemo(() => {
    const auditoriaMap = new Map<string, number>();

    auditorias.forEach((auditoria) => {
      const impacto = hallazgos
        .filter((h) => h.nombre_Auditoria === auditoria)
        .reduce((sum, h) => sum + (h.montoImpacto || 0), 0);
      auditoriaMap.set(auditoria, impacto);
    });

    return Array.from(auditoriaMap.entries())
      .filter(([nombre]) => !selectedAuditoria || nombre === selectedAuditoria)
      .map(([nombre_Auditoria, impacto]) => ({ nombre_Auditoria, impacto }));
  }, [hallazgos, auditorias, selectedAuditoria]);

  // Calcular hallazgos pendientes por semáforo (solo NCA, NCM, NCB)
  const pendientesPorSemaforo = useMemo(() => {
    const semaforos = ["NCA", "NCM", "NCB"];
    const pendienteMap: Record<string, number> = {};

    semaforos.forEach((semaforo) => {
      pendienteMap[semaforo] = hallazgosFiltrados
        .filter((h) => h.semaforo === semaforo && !h.cumplido)
        .length;
    });

    return pendienteMap;
  }, [hallazgosFiltrados]);

  // Datos para gráficos
  const barChartData = {
    labels: ["NCA", "NCM", "NCB"],
    datasets: [
      {
        label: "Hallazgos por Semáforo",
        data: [
          hallazgosPorSemaforo["NCA"] || 0,
          hallazgosPorSemaforo["NCM"] || 0,
          hallazgosPorSemaforo["NCB"] || 0,
        ],
        backgroundColor: [
          "#000000", // Negro
          "#dc3545", // Rojo
          "#ffc107", // Amarillo
        ],
      },
    ],
  };

  const pieChartData = {
    labels: ["Cumplidos", "Pendientes"],
    datasets: [
      {
        label: "Estado de Hallazgos",
        data: [hallazgosCumplidos, hallazgosPendientes],
        backgroundColor: ["#28a745", "#dc3545"],
      },
    ],
  };

  // Datos para el gráfico de pastel de monto de impacto por semáforo (2D)
  const impactoSemaforoPieData = {
    labels: ["NCA", "NCM", "NCB"],
    datasets: [
      {
        label: "Monto de Impacto ($)",
        data: [
          impactoPorSemaforo["NCA"] || 0,
          impactoPorSemaforo["NCM"] || 0,
          impactoPorSemaforo["NCB"] || 0,
      
        ],
        backgroundColor: [
          "#000000", // Negro
          "#dc3545", // Rojo
          "#ffc107", // Amarillo
        ],
        borderWidth: 1,
        borderColor: "#fff",
      },
    ],
  };

  // Datos para el gráfico de monto de impacto por auditoría
  const impactoAuditoriaChartData = useMemo(() => {
    const labels = impactoPorAuditoria.map((a) => a.nombre_Auditoria);
    const data = impactoPorAuditoria.map((a) => a.impacto);
    return {
      labels,
      datasets: [
        {
          label: "Monto de Impacto ($)",
          data,
          backgroundColor: "#800020",
        },
      ],
    };
  }, [impactoPorAuditoria]);

  
  // Generar análisis ejecutivo
  const generarAnalisis = () => {
    const totalHallazgos = hallazgosFiltrados.length;
    const totalPendientesCriticos = (pendientesPorSemaforo["NCA"] || 0) + (pendientesPorSemaforo["NCM"] || 0);

    let analisis = `**Análisis Ejecutivo - ${new Date().toLocaleDateString()}**\n\n`;
    analisis += `- Total de hallazgos registrados: ${totalHallazgos}.\n`;
    analisis += `- Monto total de impacto: $${totalImpacto.toLocaleString()}.\n`;
    analisis += `- Total de hallazgos pendientes: ${hallazgosPendientes}, de los cuales ${totalPendientesCriticos} son críticos (NCA/NCM). Urge atender estos hallazgos para mitigar riesgos.\n`;
    analisis += `- Hallazgos cumplidos: ${hallazgosCumplidos}. Mantener el enfoque en cerrar los pendientes.\n`;
    return analisis;
  };

  if (loading) {
    return <div className="text-center mt-5">Cargando...</div>;
  }

  return (
    <div className="container mt-5">
      <h2 className="mb-4 text-center fw-bold" style={{ fontFamily: "Roboto", color: "#333" }}>
        Dashboard de Hallazgos
      </h2>

      {/* Dropdown para seleccionar auditoría */}
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
                onChange={(e) => setSelectedAuditoria(e.target.value)}
              >
                <option value="">Todas las auditorías</option>
                {auditorias.map((auditoria) => (
                  <option key={auditoria} value={auditoria}>
                    {auditoria}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card text-white bg-primary mb-3 shadow-sm border-0">
            <div className="card-body text-center">
              <h5 className="card-title fw-bold">Monto Total de Impacto</h5>
              <p className="card-text text-white display-4 fw-bold">${totalImpacto.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-white bg-success mb-3 shadow-sm border-0">
            <div className="card-body text-center">
              <h5 className="card-title fw-bold">Hallazgos Cumplidos</h5>
              <p className="card-text text-white display-4 fw-bold">{hallazgosCumplidos}</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-white bg-danger mb-3 shadow-sm border-0">
            <div className="card-body text-center">
              <h5 className="card-title fw-bold">Hallazgos Pendientes</h5>
              <p className="card-text text-white display-4 fw-bold">{hallazgosPendientes}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos existentes */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card shadow-sm border-0" style={{ background: "#f8f9fa" }}>
            <div className="card-header" style={{ backgroundColor: "#800020", color: "white" }}>
              <h5 className="card-title mb-0 fw-bold">Hallazgos por Semáforo</h5>
            </div>
            <div className="card-body">
              <Bar
                data={barChartData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { position: "top", labels: { font: { size: 14 } } },
                    title: {
                      display: true,
                      text: "Cantidad de Hallazgos por Semáforo",
                      font: { size: 18, weight: "bold" },
                      color: "#333",
                    },
                  },
                  scales: {
                    y: { title: { display: true, text: "Cantidad", font: { size: 14 } }, beginAtZero: true },
                  },
                }}
              />
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card shadow-sm border-0" style={{ background: "#f8f9fa" }}>
            <div className="card-header" style={{ backgroundColor: "#800020", color: "white" }}>
              <h5 className="card-title mb-0 fw-bold">Estado de Hallazgos</h5>
            </div>
            <div className="card-body">
              <Pie
                data={pieChartData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { position: "top", labels: { font: { size: 14 } } },
                    title: {
                      display: true,
                      text: "Estado de Hallazgos",
                      font: { size: 18, weight: "bold" },
                      color: "#333",
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico y tabla: Monto de Impacto por Semáforo */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow-sm border-0" style={{ background: "#f8f9fa" }}>
            <div className="card-header" style={{ backgroundColor: "#800020", color: "white" }}>
              <h5 className="card-title mb-0 fw-bold">Monto de Impacto por Semáforo</h5>
            </div>
            <div className="card-body">
                <div className="row align-items-center">
                {/* Gráfico de pastel */}
                <div className="col-md-6">
                  <Pie
                  data={impactoSemaforoPieData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                    legend: {
                      position: "top",
                      labels: { font: { size: 14 }, boxWidth: 20 },
                    },
                    title: {
                      display: true,
                      text: "Distribución del Monto de Impacto",
                      font: { size: 18, weight: "bold" },
                      color: "#333",
                    },
                    tooltip: {
                      callbacks: {
                      label: (tooltipItem) => {
                        const value = tooltipItem.raw as number;
                        return `${tooltipItem.label}: $${value.toLocaleString()}`;
                      },
                      },
                    },
                    datalabels: {
                      display: false, // Deshabilitar etiquetas de datos
                    },
                    },
                  }}
                  height={300} // Reducimos la altura para dejar espacio a la tabla
                  />
                </div>
                {/* Tabla con los datos */}
                <div className="col-md-6">
                  <table className="table table-bordered table-sm">
                  <thead>
                    <tr style={{ backgroundColor: "#800020", color: "white" }}>
                    <th>Semáforo</th>
                    <th>Monto de Impacto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(impactoPorSemaforo).map(([semaforo, monto]) => (
                    <tr key={semaforo}>
                      <td>{semaforo}</td>
                      <td>${monto.toLocaleString()}</td>
                    </tr>
                    ))}
                    <tr style={{ fontWeight: "bold", backgroundColor: "#e9ecef" }}>
                    <td>Total</td>
                    <td>${totalImpacto.toLocaleString()}</td>
                    </tr>
                  </tbody>
                  </table>
                </div>
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico: Monto de Impacto por Auditoría */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow-sm border-0" style={{ background: "#f8f9fa" }}>
            <div className="card-header" style={{ backgroundColor: "#800020", color: "white" }}>
              <h5 className="card-title mb-0 fw-bold">Monto de Impacto por Auditoría</h5>
            </div>
            <div className="card-body">
              <Bar
                data={impactoAuditoriaChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: "top", labels: { font: { size: 14 } } },
                    title: {
                      display: true,
                      text: "Monto de Impacto por Auditoría",
                      font: { size: 18, weight: "bold" },
                      color: "#333",
                    },
                  },
                  scales: {
                    x: { title: { display: true, text: "Auditorías", font: { size: 14 } } },
                    y: { title: { display: true, text: "Monto ($)", font: { size: 14 } }, beginAtZero: true },
                  },
                }}
                height={400}
              />
            </div>
          </div>
        </div>
      </div>


      {/* Análisis Ejecutivo */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow-sm border-0" style={{ background: "#f8f9fa" }}>
            <div className="card-header" style={{ backgroundColor: "#800020", color: "white" }}>
              <h5 className="card-title mb-0 fw-bold">Análisis</h5>
            </div>
            <div className="card-body">
              <pre style={{ whiteSpace: "pre-wrap", fontSize: "14px", color: "#333" }}>
                {generarAnalisis()}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HallazgoDashboard;