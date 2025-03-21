import React, { useEffect, useState, useMemo } from "react";
import { getPlanesAuditoria, getProcesos, getAuditorias } from "../../services/PlanAuditoriaService";
import { PlanAuditoria } from "../../services/PlanAuditoriaService";
import { Auditoria } from "../../services/AuditoriaService";
import { Bar, Chart } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { MatrixController, MatrixElement } from "chartjs-chart-matrix"; // Para el mapa de calor
import ChartDataLabels from "chartjs-plugin-datalabels"; // Plugin para etiquetas de datos
import "../../styles/cards.css";
import { useNavigate } from "react-router-dom";

// Registrar componentes de Chart.js, el plugin de etiquetas y los componentes del mapa de calor
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels,
  MatrixController,
  MatrixElement
);

const PlanAuditoriaDashboard: React.FC = () => {
  const [planesAuditoria, setPlanesAuditoria] = useState<PlanAuditoria[]>([]);
  const [procesos, setProcesos] = useState<{ idProceso: number; nombreProceso: string }[]>([]);
  const [auditorias, setAuditorias] = useState<Auditoria[]>([]);
  const [selectedAuditoriaNombre, setSelectedAuditoriaNombre] = useState<string>("");
  const [loading, setLoading] = useState(true);
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
      setProcesos(data);
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

  // Calcular puntajes de riesgo (probabilidad e impacto) para el mapa de calor
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
      probability: data.count > 0 ? Math.round(data.probability / data.count) : 1,
      impact: data.count > 0 ? Math.round(data.impact / data.count) : 1,
      count: data.count,
    }));
  }, [planesFiltrados, procesos]);

  // Datos para el mapa de calor
  const heatmapData = useMemo(() => {
    // Crear una matriz para agrupar procesos por celda
    const matrix = Array(5)
      .fill(0)
      .map(() => Array(5).fill({ counts: [], nombres: [] }));

    // Agrupar procesos por celda basada en probabilidad e impacto
    riskScoresPorProceso.forEach((proc) => {
      const x = proc.impact - 1; // Índice 0-4
      const y = proc.probability - 1; // Índice 0-4
      if (x >= 0 && x < 5 && y >= 0 && y < 5) {
        matrix[y][x].counts.push(proc.count); // Almacenar el conteo individual
        matrix[y][x].nombres.push(proc.nombreProceso); // Almacenar los nombres
      }
    });

    // Preparar datos para el mapa de calor
    const data = [];
    for (let y = 0; y < 5; y++) {
      for (let x = 0; x < 5; x++) {
        data.push({
          x: x + 1, // Convertir a 1-5
          y: 5 - y, // Invertir para que "Constante" esté arriba
          v: matrix[y][x].counts.length > 0 ? 1 : 0, // Usar 1 si hay datos, 0 si no
          counts: matrix[y][x].counts, // Array de conteos
          nombres: matrix[y][x].nombres, // Array de nombres
        });
      }
    }

    return {
      datasets: [
        {
          label: "Riesgo por Proceso",
          data: data,
          backgroundColor: (ctx: any) => {
            const value = ctx.dataset.data[ctx.dataIndex];
            const prob = value.y;
            const imp = value.x;

            if (prob === 1) return imp <= 2 ? "#28a745" : "#ffc107";
            if (prob === 2) return imp <= 2 ? "#28a745" : imp <= 3 ? "#ffc107" : "#dc3545";
            if (prob === 3) return imp <= 2 ? "#28a745" : imp <= 3 ? "#ffc107" : "#dc3545";
            if (prob === 4) return imp <= 2 ? "#ffc107" : "#dc3545";
            if (prob === 5) return imp <= 3 ? "#ffc107" : "#dc3545";
            return "#28a745";
          },
          borderColor: "#333",
          borderWidth: 1,
          width: ({ chart }: any) => (chart.chartArea?.width || 0) / 5 - 1,
          height: ({ chart }: any) => (chart.chartArea?.height || 0) / 5 - 1,
        },
      ],
    };
  }, [riskScoresPorProceso]);

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
      .filter((p) => p.probability >= 4 && p.impact >= 4)
      .map((p) => p.nombreProceso);
    const moderateRiskProcesses = riskScoresPorProceso
      .filter((p) => (p.probability === 3 && p.impact >= 3) || (p.probability >= 4 && p.impact <= 3))
      .map((p) => p.nombreProceso);
    const lowRiskProcesses = riskScoresPorProceso
      .filter((p) => p.probability <= 2 && p.impact <= 2)
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

    analisis += `\n### Matriz de Riesgo (Mapa de Calor)\n`;
    analisis += `- Total de procesos analizados: ${riskScoresPorProceso.length}.\n`;
    if (highRiskProcesses.length > 0) {
      analisis += `- **Riesgo Alto (Probabilidad e Impacto ≥ 4):** ${highRiskProcesses.join(", ")}. Se requiere acción inmediata para mitigar riesgos.\n`;
    } else {
      analisis += `- No se identificaron procesos de riesgo alto.\n`;
    }
    if (moderateRiskProcesses.length > 0) {
      analisis += `- **Riesgo Moderado (Probabilidad o Impacto ≥ 3):** ${moderateRiskProcesses.join(", ")}. Se recomienda monitoreo y planes de acción preventivos.\n`;
    } else {
      analisis += `- No se identificaron procesos de riesgo moderado.\n`;
    }
    if (lowRiskProcesses.length > 0) {
      analisis += `- **Riesgo Bajo (Probabilidad e Impacto ≤ 2):** ${lowRiskProcesses.join(", ")}. Estos procesos están bajo control.\n`;
    } else {
      analisis += `- No se identificaron procesos de riesgo bajo.\n`;
    }

    analisis += `\n### Recomendaciones Generales\n`;
    analisis += `- Enfocarse en reducir la proporción de NCA y NCM mediante revisiones detalladas y planes de acción específicos.\n`;
    analisis += `- Priorizar los procesos de riesgo alto y moderado identificados en el mapa de calor para auditorías más frecuentes y establecer controles más estrictos.\n`;
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

      {/* Gráfico de Barras (Original) */}
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
                      display: true,
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

      {/* Mapa de Calor (Heatmap) */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow-sm border-0" style={{ background: "#f8f9fa" }}>
            <div className="card-header" style={{ backgroundColor: "#800020", color: "white" }}>
              <h5 className="card-title mb-0 fw-bold">Matriz de Riesgo por Proceso</h5>
            </div>
            <div className="card-body">
              <Chart
                type="matrix"
                data={heatmapData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      callbacks: {
                        label: (context: any) => {
                          const data = context.dataset.data[context.dataIndex];
                            return `${data.nombres.join(", ")}:\nProbabilidad=${data.y},\nImpacto=${data.x},\nConteos=${data.counts.join(", ")}`;
                          },
                          },
                        },
                        title: {
                          display: true,
                          text: "Matriz de Riesgo (Probabilidad vs Impacto)",
                          font: { size: 18, weight: "bold" },
                          color: "#333",
                        },
                        datalabels: {
                          color: "#ffffff",
                          anchor: "center",
                          align: "center",
                          font: {
                          weight: "bold",
                          size: 10, // Reducir tamaño para que quepan múltiples líneas
                          lineHeight: 1.2, // Espaciado entre líneas
                          },
                          formatter: (value: any) => {
                        if (value.counts.length > 0) {
                          // Filtrar solo los conteos mayores a 0 y unirlos con saltos de línea
                          const nonZeroCounts = value.counts.filter((count: number) => count > 0);
                          return nonZeroCounts.length > 0 ? nonZeroCounts.join("\n") : "";
                        }
                        return "";
                      },
                    },
                  },
                  scales: {
                    x: {
                      title: { display: true, text: "Impacto", font: { size: 14 } },
                      ticks: {
                        stepSize: 1,
                        callback: (value: any) => {
                          const labels = ["Insignificante", "Menor", "Crítica", "Mayor", "Catastrófico"];
                          return labels[value - 1] || value;
                        },
                      },
                      min: 1,
                      max: 5,
                    },
                    y: {
                      title: { display: true, text: "Probabilidad", font: { size: 14 } },
                      ticks: {
                        stepSize: 1,
                        callback: (value: any) => {
                          const labels = ["Improbable", "Posible", "Ocasional", "Moderado", "Constante"];
                          return labels[value - 1] || value;
                        },
                      },
                      min: 1,
                      max: 5,
                    },
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

export default PlanAuditoriaDashboard;