import React, { useEffect, useState, useMemo, Suspense } from "react";
import { getPlanesAuditoria, getAuditorias } from "../../services/PlanAuditoriaService";
import { getProcesos } from "../../services/ProcesoService";
import { PlanAuditoria } from "../../services/PlanAuditoriaService";
import { Auditoria } from "../../services/AuditoriaService";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import "../../styles/cards.css";
import { useNavigate } from "react-router-dom";

// Importar Plotly de manera dinámica para evitar problemas de tipado con JSX
const Plotly = React.lazy(() => import("react-plotly.js") as Promise<{ default: React.ComponentType<any> }>);

// Registrar componentes de Chart.js y el plugin de etiquetas
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

const PlanAuditoriaDashboard: React.FC = () => {
  const [planesAuditoria, setPlanesAuditoria] = useState<PlanAuditoria[]>([]);
  const [procesos, setProcesos] = useState<{ idProceso: number; nombreProceso: string }[]>([]);
  const [auditorias, setAuditorias] = useState<Auditoria[]>([]);
  const [selectedAuditoriaNombre, setSelectedAuditoriaNombre] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [showLabels, setShowLabels] = useState(false); // Estado para controlar la visibilidad de las etiquetas
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
    fetchPlanesAuditoria();
    fetchProcesos();
    fetchAuditorias();
  }, [navigate]);

  const fetchPlanesAuditoria = async () => {
    try {
      const data = await getPlanesAuditoria();
      console.log("Datos de planes de auditoría:", data);
      setPlanesAuditoria(data);
    } catch (error) {
      console.error("Error al obtener los planes de auditoría:", error);
    }
  };

  const fetchProcesos = async () => {
    try {
      const data = await getProcesos();
      console.log("Datos de procesos:", data);
      setProcesos(data.filter((proceso) => proceso.idProceso !== undefined) as { idProceso: number; nombreProceso: string }[]);
    } catch (error) {
      console.error("Error al obtener los procesos:", error);
    }
  };

  const fetchAuditorias = async () => {
    try {
      const data = await getAuditorias();
      console.log("Datos de auditorías:", data);
      setAuditorias(data);
      if (data.length > 0) {
        setSelectedAuditoriaNombre(data[0].nombreAuditoria);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error al obtener las auditorías:", error);
      setLoading(false);
    }
  };

  const selectedAuditoriaId = useMemo(() => {
    const auditoriaSeleccionada = auditorias.find(
      (auditoria) => auditoria.nombreAuditoria === selectedAuditoriaNombre
    );
    return auditoriaSeleccionada ? auditoriaSeleccionada.id_Auditoria : null;
  }, [selectedAuditoriaNombre, auditorias]);

  const planesFiltrados = useMemo(() => {
    return selectedAuditoriaId !== null
      ? planesAuditoria.filter((plan) => plan.id_Auditoria === selectedAuditoriaId)
      : [];
  }, [planesAuditoria, selectedAuditoriaId]);

  // Contar semáforos por proceso para la auditoría seleccionada (Gráfico de barras)
  const semaforosPorProceso = useMemo(() => {
    const procesoMap = new Map<string, Record<string, number>>();

    procesos.forEach((proc) => {
      procesoMap.set(proc.nombreProceso, { NCA: 0, NCM: 0, NCB: 0, OM: 0, C: 0 });
    });

    planesFiltrados.forEach((plan) => {
      const nombreProceso = procesos.find((p) => p.idProceso === plan.idProceso)?.nombreProceso || "Sin Proceso";
      if (!procesoMap.has(nombreProceso)) {
        procesoMap.set(nombreProceso, { NCA: 0, NCM: 0, NCB: 0, OM: 0, C: 0 });
      }
      const procesoData = procesoMap.get(nombreProceso)!;
      if (["NCA", "NCM", "NCB", "OM", "C"].includes(plan.semaforo)) {
        procesoData[plan.semaforo] = (procesoData[plan.semaforo] || 0) + 1;
      } else {
        console.warn(`Semáforo no reconocido: ${plan.semaforo} para proceso ${nombreProceso}`);
      }
    });

    return Array.from(procesoMap.entries()).map(([nombreProceso, counts]) => ({
      nombreProceso,
      NCA: counts.NCA,
      NCM: counts.NCM,
      NCB: counts.NCB,
      OM: counts.OM,
      C: counts.C,
    }));
  }, [planesFiltrados, procesos]);

  // Datos para el gráfico de barras
  const semaforoBarChartData = useMemo(() => {
    const labels = semaforosPorProceso.map((p) => p.nombreProceso);
    const datasets = [
      { label: "NCA", data: semaforosPorProceso.map((p) => p.NCA), backgroundColor: "#000000" },
      { label: "NCM", data: semaforosPorProceso.map((p) => p.NCM), backgroundColor: "#dc3545" },
      { label: "NCB", data: semaforosPorProceso.map((p) => p.NCB), backgroundColor: "#ffc107" },
      { label: "OM", data: semaforosPorProceso.map((p) => p.OM), backgroundColor: "#28a745" },
      { label: "C", data: semaforosPorProceso.map((p) => p.C), backgroundColor: "#17a2b8" },
    ];

    return {
      labels,
      datasets,
    };
  }, [semaforosPorProceso]);

  // Calcular puntajes de riesgo (probabilidad e impacto) para el treemap
  const riskScoresPorProceso = useMemo(() => {
    const procesoMap = new Map<string, { probability: number; impact: number; count: number; nombreProceso: string }>();

    procesos.forEach((proc) => {
      procesoMap.set(proc.nombreProceso, { probability: 0, impact: 0, count: 0, nombreProceso: proc.nombreProceso });
    });

    planesFiltrados.forEach((plan) => {
      const nombreProceso = procesos.find((p) => p.idProceso === plan.idProceso)?.nombreProceso || "Sin Proceso";
      if (!procesoMap.has(nombreProceso)) {
        procesoMap.set(nombreProceso, { probability: 0, impact: 0, count: 0, nombreProceso });
      }
      const procesoData = procesoMap.get(nombreProceso)!;

      let prob = 0,
        imp = 0;
      switch (plan.semaforo) {
        case "NCA":
          prob = 5;
          imp = 5;
          break;
        case "NCM":
          prob = 4;
          imp = 4;
          break;
        case "NCB":
          prob = 3;
          imp = 3;
          break;
        case "OM":
          prob = 2;
          imp = 2;
          break;
        case "C":
          prob = 1;
          imp = 1;
          break;
        default:
          console.warn(`Semáforo no reconocido: ${plan.semaforo}`);
      }

      procesoData.probability += prob;
      procesoData.impact += imp;
      procesoData.count += 1;
    });

    return Array.from(procesoMap.entries()).map(([nombreProceso, data]) => ({
      nombreProceso,
      probability: data.count > 0 ? Math.round(data.probability / data.count) : 0,
      impact: data.count > 0 ? Math.round(data.impact / data.count) : 0,
      count: data.count,
    }));
  }, [planesFiltrados, procesos]);

  // Datos para el treemap con Plotly.js (usamos any para evitar errores de tipado)
  const treemapData: any = useMemo(() => {
    const labels = riskScoresPorProceso.map((proc) => {
      const riskLevel = (proc.probability + proc.impact) / 2;
      return riskLevel === 0
        ? `${proc.nombreProceso}<br>Sin Riesgo`
        : `${proc.nombreProceso}<br>Riesgo: ${riskLevel.toFixed(1)}`;
    });
    const parents = riskScoresPorProceso.map(() => ""); // Sin padres, todos los procesos son de nivel superior
    const values = riskScoresPorProceso.map((proc) => proc.count); // Tamaño basado en el número de planes
    const riskLevels = riskScoresPorProceso.map((proc) => (proc.probability + proc.impact) / 2); // Nivel de riesgo (promedio de probabilidad e impacto)

    // Normalizar el nivel de riesgo entre 0 y 1 (rango de 1 a 5, pero ajustado para incluir 0)
    const normalizedRiskLevels = riskLevels.map((risk) => (risk === 0 ? 0 : (risk - 1) / 4));

    // Escala de colores original (verde claro -> amarillo -> rojo intenso)
    const colorscale = [
      [0, "rgba(144, 238, 144, 0.8)"], // Verde claro para riesgo 1 (o 0)
      [0.5, "rgba(255, 255, 102, 0.8)"], // Amarillo para riesgo 3
      [1, "rgba(255, 69, 0, 0.8)"], // Rojo intenso para riesgo 5
    ];

    return [
      {
        type: "treemap",
        labels,
        parents,
        values,
        marker: {
          colors: normalizedRiskLevels,
          colorscale,
          showscale: true, // Mostrar barra de color
          colorbar: {
            title: "Nivel de Riesgo",
            titleside: "right",
            tickvals: [0, 0.5, 1],
            ticktext: ["1 (Bajo)", "3 (Moderado)", "5 (Alto)"],
          },
          line: {
            color: "rgba(0,0,0,0)", // Color transparente para eliminar el contorno
            width: 0, // Grosor 0 para eliminar el contorno
          },
        },
        textinfo: showLabels ? "label" : "none", // Mostrar u ocultar etiquetas según el estado
        textposition: "middle center", // Centrar las etiquetas
        textfont: {
          size: 14,
          color: "#fff",
          family: "Roboto",
        },
        hoverinfo: "text",
        hovertext: riskScoresPorProceso.map((proc) => {
          const riskLevel = (proc.probability + proc.impact) / 2;
          const impactLabels = ["Sin Impacto", "Insignificante", "Menor", "Crítico", "Mayor", "Catastrófico"];
          const probabilityLabels = ["Sin Probabilidad", "Improbable", "Posible", "Ocasional", "Moderado", "Constante"];
          const impactIndex = proc.impact >= 0 ? proc.impact : 0;
          const probabilityIndex = proc.probability >= 0 ? proc.probability : 0;
          return `Proceso: ${proc.nombreProceso}<br>Impacto: ${impactLabels[impactIndex]}<br>Probabilidad: ${probabilityLabels[probabilityIndex]}<br>Nivel de Riesgo: ${riskLevel === 0 ? "Sin Riesgo" : riskLevel.toFixed(1)}<br>Total Actividades: ${proc.count}`;
        }),
        tiling: {
          pad: 0, // Eliminar cualquier padding entre los rectángulos
          packing: "squarify", // Usar el algoritmo squarify para un mejor ajuste
        },
      },
    ];
  }, [riskScoresPorProceso, showLabels]);

  // Layout para el treemap (usamos any para evitar errores de tipado)
  const treemapLayout: any = useMemo(() => ({
    title: {
      text: "Análisis de Riesgo por Proceso (Treemap)",
      font: {
        size: 20,
        family: "Roboto",
        color: "#333",
        weight: 700,
      },
      x: 0.5,
      xanchor: "center",
    },
    margin: { t: 100, b: 50, l: 50, r: 100 }, // Espacio adicional a la derecha para la barra de color
    height: 600,
    width: 900,
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    font: {
      family: "Roboto",
      color: "#555",
    },
  }), []);

  // Análisis combinado para ambas gráficas
  const generarAnalisis = () => {
    const totalSemaforos = planesFiltrados.length;
    const totalNCA = semaforosPorProceso.reduce((sum, p) => sum + p.NCA, 0);
    const totalNCM = semaforosPorProceso.reduce((sum, p) => sum + p.NCM, 0);
    const totalNCB = semaforosPorProceso.reduce((sum, p) => sum + p.NCB, 0);
    const totalOM = semaforosPorProceso.reduce((sum, p) => sum + p.OM, 0);
    const totalC = semaforosPorProceso.reduce((sum, p) => sum + p.C, 0);
    const procesosCriticos = semaforosPorProceso
      .filter((p) => p.NCM + p.NCA > 0)
      .map((p) => p.nombreProceso);
    const procesosExitosos = semaforosPorProceso
      .filter((p) => p.OM + p.C > 0 && p.NCM + p.NCA === 0)
      .map((p) => p.nombreProceso);

    const highRiskProcesses = riskScoresPorProceso
      .filter((p) => (p.probability + p.impact) / 2 >= 4)
      .map((p) => p.nombreProceso);
    const moderateRiskProcesses = riskScoresPorProceso
      .filter((p) => (p.probability + p.impact) / 2 >= 3 && (p.probability + p.impact) / 2 < 4)
      .map((p) => p.nombreProceso);
    const lowRiskProcesses = riskScoresPorProceso
      .filter((p) => (p.probability + p.impact) / 2 > 0 && (p.probability + p.impact) / 2 < 3)
      .map((p) => p.nombreProceso);
    const noRiskProcesses = riskScoresPorProceso
      .filter((p) => (p.probability + p.impact) / 2 === 0)
      .map((p) => p.nombreProceso);

    let analisis = `**Análisis Ejecutivo - ${new Date().toLocaleDateString()}**\n\n`;
    analisis += `- Auditoría seleccionada: ${selectedAuditoriaNombre || "ninguna auditoría"}.\n`;
    analisis += `- Total de planes de auditoría registrados: ${totalSemaforos}.\n`;

    analisis += `\n### Distribución de Semáforos (Gráfico de Barras)\n`;
    analisis += `- Total de semáforos:\n`;
    analisis += `  - NCA (Negro - Crítico): ${totalNCA} (${((totalNCA / totalSemaforos) * 100 || 0).toFixed(1)}%)\n`;
    analisis += `  - NCM (Rojo - Alto Riesgo): ${totalNCM} (${((totalNCM / totalSemaforos) * 100 || 0).toFixed(1)}%)\n`;
    analisis += `  - NCB (Amarillo - Moderado): ${totalNCB} (${((totalNCB / totalSemaforos) * 100 || 0).toFixed(1)}%)\n`;
    analisis += `  - OM (Verde - Óptimo): ${totalOM} (${((totalOM / totalSemaforos) * 100 || 0).toFixed(1)}%)\n`;
    analisis += `  - C (Azul - Cumplido): ${totalC} (${((totalC / totalSemaforos) * 100 || 0).toFixed(1)}%)\n`;
    if (procesosCriticos.length > 0) {
      analisis += `- Procesos críticos (con NCM o NCA): ${procesosCriticos.join(", ")}. Se recomienda priorizar acciones correctivas inmediatas.\n`;
    } else {
      analisis += `- No se identificaron procesos críticos (sin NCM ni NCA).\n`;
    }
    if (procesosExitosos.length > 0) {
      analisis += `- Procesos con buen desempeño (OM y C predominantes): ${procesosExitosos.join(", ")}. Estos pueden servir como referencia para optimizar otros procesos.\n`;
    } else {
      analisis += `- No se identificaron procesos con buen desempeño (sin OM ni C predominantes).\n`;
    }

    analisis += `\n### Análisis de Riesgo por Proceso (Treemap)\n`;
    analisis += `- Total de procesos analizados: ${riskScoresPorProceso.length}.\n`;
    analisis += `- Nota: El tamaño de cada rectángulo representa el número de planes. La intensidad del color indica el nivel de riesgo (verde claro = bajo, amarillo = moderado, rojo intenso = alto). El nivel de riesgo se muestra en cada rectángulo. Pase el cursor sobre los rectángulos para ver más detalles.\n`;
    if (noRiskProcesses.length > 0) {
      analisis += `- **Sin Riesgo (Nivel de Riesgo = 0):** ${noRiskProcesses.join(", ")}. Estos procesos no presentan riesgo.\n`;
    } else {
      analisis += `- No se identificaron procesos sin riesgo.\n`;
    }
    if (highRiskProcesses.length > 0) {
      analisis += `- **Riesgo Alto (Nivel de Riesgo ≥ 4):** ${highRiskProcesses.join(", ")}. Se requiere acción inmediata para mitigar riesgos.\n`;
    } else {
      analisis += `- No se identificaron procesos de riesgo alto.\n`;
    }
    if (moderateRiskProcesses.length > 0) {
      analisis += `- **Riesgo Moderado (Nivel de Riesgo entre 3 y 4):** ${moderateRiskProcesses.join(", ")}. Se recomienda monitoreo y planes de acción preventivos.\n`;
    } else {
      analisis += `- No se identificaron procesos de riesgo moderado.\n`;
    }
    if (lowRiskProcesses.length > 0) {
      analisis += `- **Riesgo Bajo (Nivel de Riesgo entre 0 y 3):** ${lowRiskProcesses.join(", ")}. Estos procesos están bajo control.\n`;
    } else {
      analisis += `- No se identificaron procesos de riesgo bajo.\n`;
    }

    analisis += `\n### Recomendaciones Generales\n`;
    analisis += `- Enfocarse en reducir la proporción de NCA y NCM mediante revisiones detalladas y planes de acción específicos.\n`;
    analisis += `- Priorizar los procesos de riesgo alto y moderado identificados en el treemap para auditorías más frecuentes y establecer controles más estrictos.\n`;
    return analisis;
  };

  if (loading) {
    return <div className="text-center mt-5">Cargando...</div>;
  }

  return (
    <div className="container mt-5">
      <h2 className="mb-4 text-center fw-bold" style={{ fontFamily: "Roboto", color: "#333" }}>
        Tablero Ejecutivo - Plan de Auditoría
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
                value={selectedAuditoriaNombre}
                onChange={(e) => setSelectedAuditoriaNombre(e.target.value)}
              >
                {auditorias.map((auditoria) => (
                  <option key={auditoria.id_Auditoria} value={auditoria.nombreAuditoria}>
                    {auditoria.nombreAuditoria}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico de Barras (Original con Chart.js) */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow-sm border-0" style={{ background: "#f8f9fa" }}>
            <div className="card-header" style={{ backgroundColor: "#800020", color: "white" }}>
              <h5 className="card-title mb-0 fw-bold">Distribución de Semáforos por Proceso</h5>
            </div>
            <div className="card-body">
              <Bar
                data={semaforoBarChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: "top", labels: { font: { size: 14 } } },
                    title: {
                      display: false,
                      text: "Cantidad de Semáforos por Proceso",
                      font: { size: 18, weight: "bold" },
                      color: "#333",
                    },
                    datalabels: {
                      color: "#ffffff",
                      anchor: "center",
                      align: "center",
                      font: {
                        weight: "bold",
                        size: 12,
                      },
                      formatter: (value: number) => (value > 0 ? value : ""),
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

      {/* Gráfico Treemap con Plotly.js */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow-sm border-0" style={{ background: "#f8f9fa" }}>
            <div className="card-header d-flex justify-content-between align-items-center" style={{ backgroundColor: "#800020", color: "white" }}>
              <h5 className="card-title mb-0 fw-bold">Análisis de Riesgo por Proceso</h5>
              <button style={{backgroundColor: "orange", color: "white"}}
                className="btn btn-light btn-sm"
                onClick={() => setShowLabels(!showLabels)}
              >
                {showLabels ? "Ocultar Etiquetas" : "Mostrar Etiquetas"}
              </button>
            </div>
            <div className="card-body">
              <div style={{ display: "flex", justifyContent: "center" }}>
                <Suspense fallback={<div>Cargando gráfico...</div>}>
                  <Plotly
                    data={treemapData}
                    layout={treemapLayout}
                    style={{ width: "100%", maxWidth: "900px", height: "600px" }}
                    config={{
                      responsive: true,
                      displayModeBar: false, // Ocultar la barra de herramientas (incluye el botón de captura)
                      displaylogo: false, // Ocultar el logo de Plotly
                    }}
                  />
                </Suspense>
              </div>
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

export default PlanAuditoriaDashboard;