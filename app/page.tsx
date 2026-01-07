"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import ReactFlow, {
  useNodesState, useEdgesState, MarkerType, Node, Edge, Position,
  Background, Controls, ConnectionLineType,
} from "reactflow";
import "reactflow/dist/style.css";
import dagre from "dagre";
import { PLAN_ESTUDIOS } from "@/data/materias";
import { useRouter } from "next/navigation";
import { LogOut, CheckCircle, Unlock, AlertCircle, X, Save, Calculator, Lock, Plus, Minus, Trash2, TrendingUp, AlertTriangle } from "lucide-react";

// --- TIPOS ---
type EstadoMateria = "REGULAR" | "APROBADA";
interface ProgresoMateria {
  materiaId: number;
  estado: EstadoMateria;
  nota: number | null;
  aplazos: number;
  notaAplazo1?: number | null;
  notaAplazo2?: number | null;
  notaAplazo3?: number | null;
}

// --- CONFIGURACIÓN GRAFO ---
const NODE_WIDTH = 240;
const NODE_HEIGHT = 110;

const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: "LR", ranksep: 80, nodesep: 30 });

  nodes.forEach((node) => dagreGraph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT }));
  edges.forEach((edge) => dagreGraph.setEdge(edge.source, edge.target));

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = Position.Left;
    node.sourcePosition = Position.Right;
    node.position = {
      x: nodeWithPosition.x - NODE_WIDTH / 2,
      y: nodeWithPosition.y - NODE_HEIGHT / 2,
    };
  });
  return { nodes, edges };
};

export default function AcademicMap() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [progreso, setProgreso] = useState<Record<number, ProgresoMateria>>({});
  
  // --- Estados del Modal ---
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMateriaId, setSelectedMateriaId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // Nuevo estado para errores
  
  const [formData, setFormData] = useState({ 
    nota: "", 
    estado: "APROBADA" as EstadoMateria, 
    cantidadAplazos: 0,
    notaAplazo1: "",
    notaAplazo2: "",
    notaAplazo3: ""
  });

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // --- 1. Cargar Datos ---
  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (!storedUserId) { router.push("/login"); return; }
    setUserId(storedUserId);

    fetch(`/api/progreso?userId=${storedUserId}`)
      .then((res) => res.json())
      .then((data: ProgresoMateria[]) => {
        const mapa = data.reduce((acc, item) => {
          acc[item.materiaId] = item;
          return acc;
        }, {} as Record<number, ProgresoMateria>);
        setProgreso(mapa);
      });
  }, [router]);

  // --- 2. CÁLCULOS MATEMÁTICOS ---
  const estadisticas = useMemo(() => {
    const materias = Object.values(progreso);
    let sumaTotalNotas = 0;
    let cantidadTotalExamenes = 0;
    let totalAplazosCount = 0;
    let materiasAprobadasCount = 0;

    materias.forEach(p => {
        if (p.estado === "APROBADA" && p.nota && p.nota > 0) {
            sumaTotalNotas += p.nota;
            cantidadTotalExamenes++;
            materiasAprobadasCount++;
        }
        const notasAplazos = [p.notaAplazo1, p.notaAplazo2, p.notaAplazo3].filter(n => n !== null && n !== undefined && n > 0) as number[];
        notasAplazos.forEach(notaAplazo => {
            sumaTotalNotas += notaAplazo;
            cantidadTotalExamenes++;
        });
        totalAplazosCount += (p.aplazos || 0);
    });

    const promedio = cantidadTotalExamenes > 0 
        ? (sumaTotalNotas / cantidadTotalExamenes).toFixed(2) 
        : "0.00";

    return { promedio, count: materiasAprobadasCount, aplazos: totalAplazosCount };
  }, [progreso]);

  const promedioMateriaActual = useMemo(() => {
    const notas = [];
    if (formData.estado === "APROBADA" && formData.nota) {
        notas.push(parseFloat(formData.nota));
    }
    if (formData.cantidadAplazos >= 1 && formData.notaAplazo1) notas.push(parseFloat(formData.notaAplazo1));
    if (formData.cantidadAplazos >= 2 && formData.notaAplazo2) notas.push(parseFloat(formData.notaAplazo2));
    if (formData.cantidadAplazos >= 3 && formData.notaAplazo3) notas.push(parseFloat(formData.notaAplazo3));

    if (notas.length === 0) return null;
    const suma = notas.reduce((a, b) => a + b, 0);
    return (suma / notas.length).toFixed(2);
  }, [formData]);


  // --- 3. Generar Nodos ---
  useEffect(() => {
    if (!PLAN_ESTUDIOS.length) return;
    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];

    PLAN_ESTUDIOS.forEach((materia) => {
      const datosUsuario = progreso[materia.id];
      const isRegular = datosUsuario?.estado === "REGULAR";
      const isApproved = datosUsuario?.estado === "APROBADA";
      
      const correlativasCumplidas = materia.correlativasCursada.every((id) => progreso[id]);
      const isAvailable = !datosUsuario && correlativasCumplidas;
      const isLocked = !datosUsuario && !correlativasCumplidas;

      let bg = "#0f172a"; 
      let border = "#334155";
      let statusIcon = <Lock size={12} />;
      let statusText = "Bloqueada";
      let statusColor = "text-slate-500";

      if (isApproved) {
        bg = "rgba(6, 78, 59, 0.95)"; border = "#10b981";
        statusIcon = <CheckCircle size={12} />; 
        statusText = `Aprobada: ${datosUsuario.nota || '-'}`;
        statusColor = "text-green-400";
      } else if (isRegular) {
        bg = "rgba(113, 63, 18, 0.95)"; border = "#eab308";
        statusIcon = <AlertCircle size={12} />; statusText = "Regularizada";
        statusColor = "text-yellow-400";
      } else if (isAvailable) {
        bg = "rgba(30, 58, 138, 0.95)"; border = "#3b82f6";
        statusIcon = <Unlock size={12} />; statusText = "Habilitada";
        statusColor = "text-blue-400 animate-pulse";
      }

      const aplazosBadges = [];
      if (datosUsuario?.notaAplazo1) aplazosBadges.push(datosUsuario.notaAplazo1);
      if (datosUsuario?.notaAplazo2) aplazosBadges.push(datosUsuario.notaAplazo2);
      if (datosUsuario?.notaAplazo3) aplazosBadges.push(datosUsuario.notaAplazo3);

      newNodes.push({
        id: materia.id.toString(),
        data: {
            materiaId: materia.id,
            label: (
                <div className="flex flex-col h-full justify-between w-full">
                   <div className="flex justify-between items-start">
                        <span className="text-[9px] uppercase tracking-widest opacity-60 font-bold">Nivel {materia.nivel}°</span>
                        {aplazosBadges.length > 0 && (
                             <div className="flex gap-1">
                                {aplazosBadges.map((ap, i) => (
                                    <span key={i} className="text-[9px] bg-red-500/20 text-red-300 px-1.5 rounded font-mono border border-red-500/30">
                                        {ap}
                                    </span>
                                ))}
                             </div>
                        )}
                   </div>
                   <div className="font-bold text-sm leading-tight truncate my-1" title={materia.nombre}>{materia.nombre}</div>
                   <div className={`text-xs flex items-center gap-1.5 font-bold ${statusColor} bg-black/20 p-1.5 rounded-lg w-fit`}>
                       {statusIcon} {statusText}
                   </div>
                </div>
            )
        },
        style: {
          background: bg, border: `2px solid ${border}`, color: "#e2e8f0",
          borderRadius: "16px", padding: "14px", width: NODE_WIDTH, minHeight: NODE_HEIGHT,
          boxShadow: isAvailable || isApproved ? "0 10px 30px -10px rgba(0,0,0,0.5)" : "none",
          cursor: "pointer", transition: "all 0.3s ease"
        },
        position: { x: 0, y: 0 },
      });

      materia.correlativasCursada.forEach((sourceId) => {
        newEdges.push({
          id: `e${sourceId}-${materia.id}`,
          source: sourceId.toString(),
          target: materia.id.toString(),
          type: "smoothstep",
          animated: isAvailable,
          style: { 
            stroke: isLocked ? "#1e293b" : (isApproved ? "#059669" : isRegular ? "#d97706" : "#475569"),
            strokeWidth: isAvailable ? 2 : 1.5 
          },
        });
      });
    });

    const layout = getLayoutedElements(newNodes, newEdges);
    setNodes(layout.nodes);
    setEdges(layout.edges);
  }, [progreso]);

  // --- 4. Abrir Modal ---
  const onNodeClick = useCallback((_: any, node: Node) => {
    const id = node.data.materiaId;
    const currentData = progreso[id];
    
    setSelectedMateriaId(id);
    setErrorMessage(null); // Limpiar errores previos
    setFormData({
        nota: currentData?.nota?.toString() || "",
        estado: currentData?.estado || "APROBADA",
        cantidadAplazos: currentData?.aplazos || 0,
        notaAplazo1: currentData?.notaAplazo1?.toString() || "",
        notaAplazo2: currentData?.notaAplazo2?.toString() || "",
        notaAplazo3: currentData?.notaAplazo3?.toString() || "",
    });
    setModalOpen(true);
  }, [progreso]);

  const cambiarCantidadAplazos = (delta: number) => {
    setFormData(prev => {
        const nuevaCantidad = Math.max(0, Math.min(3, prev.cantidadAplazos + delta));
        return { ...prev, cantidadAplazos: nuevaCantidad };
    });
  };

  // --- 5. Guardar con VALIDACIONES ---
  const handleSave = async () => {
    if (!selectedMateriaId || !userId) return;
    setErrorMessage(null);

    // --- VALIDACIONES ---
    // 1. Validar Nota de Aprobación
    if (formData.estado === "APROBADA") {
        const notaFinal = parseFloat(formData.nota);
        if (!formData.nota || isNaN(notaFinal)) {
            setErrorMessage("Debes ingresar una nota de aprobación.");
            return;
        }
        if (notaFinal < 6 || notaFinal > 10) {
            setErrorMessage("La nota de aprobación debe estar entre 6 y 10.");
            return;
        }
    }

    // 2. Validar Notas de Aplazos
    if (formData.cantidadAplazos >= 1) {
        const a1 = parseFloat(formData.notaAplazo1);
        if (!formData.notaAplazo1 || isNaN(a1) || a1 < 1 || a1 > 5) {
            setErrorMessage("La nota del Aplazo 1 debe estar entre 1 y 5.");
            return;
        }
    }
    if (formData.cantidadAplazos >= 2) {
        const a2 = parseFloat(formData.notaAplazo2);
        if (!formData.notaAplazo2 || isNaN(a2) || a2 < 1 || a2 > 5) {
            setErrorMessage("La nota del Aplazo 2 debe estar entre 1 y 5.");
            return;
        }
    }
    if (formData.cantidadAplazos >= 3) {
        const a3 = parseFloat(formData.notaAplazo3);
        if (!formData.notaAplazo3 || isNaN(a3) || a3 < 1 || a3 > 5) {
            setErrorMessage("La nota del Aplazo 3 debe estar entre 1 y 5.");
            return;
        }
    }

    const dataToSave = {
        materiaId: selectedMateriaId,
        estado: formData.estado,
        nota: formData.nota ? parseFloat(formData.nota) : null,
        aplazos: formData.cantidadAplazos,
        notaAplazo1: formData.cantidadAplazos >= 1 && formData.notaAplazo1 ? parseFloat(formData.notaAplazo1) : null,
        notaAplazo2: formData.cantidadAplazos >= 2 && formData.notaAplazo2 ? parseFloat(formData.notaAplazo2) : null,
        notaAplazo3: formData.cantidadAplazos >= 3 && formData.notaAplazo3 ? parseFloat(formData.notaAplazo3) : null,
    };

    setProgreso(prev => ({ ...prev, [selectedMateriaId]: dataToSave }));
    setModalOpen(false);

    await fetch("/api/progreso", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action: 'upsert', ...dataToSave }),
    });
  };

  const handleDelete = async () => {
    if (!selectedMateriaId || !userId) return;
    setProgreso(prev => {
        const copy = { ...prev };
        delete copy[selectedMateriaId];
        return copy;
    });
    setModalOpen(false);
    await fetch("/api/progreso", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, materiaId: selectedMateriaId, action: 'delete' }),
    });
  };

  return (
    <div className="w-full h-screen bg-[#020617] text-white relative flex flex-col font-sans overflow-hidden">
      
      {/* Header Stats */}
      <div className="absolute top-0 left-0 w-full z-10 p-6 pointer-events-none flex justify-center">
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl px-8 py-3 flex gap-8 shadow-2xl pointer-events-auto items-center">
            <div className="flex flex-col items-center">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-0.5">Promedio General</span>
                <span className="text-2xl font-bold text-indigo-400 flex items-center gap-2 font-mono">
                    <Calculator size={18} className="text-indigo-500"/> {estadisticas.promedio}
                </span>
            </div>
            <div className="w-px h-8 bg-slate-700"></div>
            <div className="flex flex-col items-center">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-0.5">Aprobadas</span>
                <span className="text-2xl font-bold text-green-400 font-mono">{estadisticas.count}</span>
            </div>
            <div className="w-px h-8 bg-slate-700"></div>
            <div className="flex flex-col items-center">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-0.5">Aplazos</span>
                <span className="text-2xl font-bold text-red-400 font-mono">{estadisticas.aplazos}</span>
            </div>
        </div>
      </div>

      <button onClick={() => router.push("/login")} className="absolute top-6 right-6 z-20 bg-slate-800/80 p-3 rounded-full hover:bg-slate-700 transition border border-slate-700">
        <LogOut size={20} className="text-slate-400"/>
      </button>

      <ReactFlow
        nodes={nodes} edges={edges}
        onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        connectionLineType={ConnectionLineType.SmoothStep}
        fitView minZoom={0.1}
        className="bg-[#020617]"
      >
        <Background color="#1e293b" gap={40} size={1} />
        {/* Controles Fixeados */}
        <Controls 
            position="bottom-left"
            style={{ margin: '20px' }} 
            className="!bg-slate-900 !border-slate-700 !shadow-2xl !rounded-xl overflow-hidden 
                       [&>button]:!bg-slate-900 [&>button]:!border-b-slate-800 
                       [&>button]:!fill-slate-400 [&>button:hover]:!fill-indigo-400 
                       [&>button:hover]:!bg-slate-800 [&>button]:transition-colors"
        />
      </ReactFlow>

      {/* MODAL EDITAR */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl p-0 shadow-2xl animate-in fade-in zoom-in duration-200 overflow-hidden">
                <div className="p-6 border-b border-slate-800 bg-slate-900 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="bg-indigo-500/20 text-indigo-400 p-1.5 rounded-lg"><Save size={18}/></span>
                        Editar Materia
                    </h2>
                    <button onClick={() => setModalOpen(false)} className="text-slate-500 hover:text-white transition"><X size={24}/></button>
                </div>
                
                <div className="p-6 space-y-6">
                    
                    {/* MENSAJE DE ERROR */}
                    {errorMessage && (
                        <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-lg flex items-center gap-2 text-red-300 text-xs font-bold animate-in slide-in-from-top-2">
                            <AlertTriangle size={16} />
                            {errorMessage}
                        </div>
                    )}

                    {/* Botones de Estado */}
                    <div>
                        <div className="grid grid-cols-2 gap-3">
                            <button 
                                onClick={() => setFormData({...formData, estado: "REGULAR"})}
                                className={`py-3 rounded-xl text-sm font-bold border-2 transition flex items-center justify-center gap-2
                                    ${formData.estado === "REGULAR" 
                                    ? "bg-yellow-500/10 border-yellow-500 text-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.2)]" 
                                    : "bg-slate-800 border-slate-800 text-slate-500 hover:border-slate-600"}`}
                            >
                                <AlertCircle size={16}/> Regularizada
                            </button>
                            <button 
                                onClick={() => setFormData({...formData, estado: "APROBADA"})}
                                className={`py-3 rounded-xl text-sm font-bold border-2 transition flex items-center justify-center gap-2
                                    ${formData.estado === "APROBADA" 
                                    ? "bg-green-500/10 border-green-500 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.2)]" 
                                    : "bg-slate-800 border-slate-800 text-slate-500 hover:border-slate-600"}`}
                            >
                                <CheckCircle size={16}/> Aprobada
                            </button>
                        </div>
                    </div>

                    {/* Nota Final */}
                    <div className={formData.estado === "REGULAR" ? "opacity-30 pointer-events-none" : ""}>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2 tracking-wider">Nota de Final (6-10)</label>
                        <div className="relative">
                            <input 
                                type="number" min="6" max="10" step="1"
                                value={formData.nota}
                                onChange={(e) => setFormData({...formData, nota: e.target.value})}
                                placeholder="Ej: 7"
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-lg font-mono focus:border-indigo-500 outline-none focus:ring-1 focus:ring-indigo-500 transition"
                            />
                            <div className="absolute right-4 top-3.5 text-slate-500 text-sm font-bold">/ 10</div>
                        </div>
                    </div>

                    {/* SECCIÓN APLAZOS */}
                    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-800">
                        <div className="flex justify-between items-center mb-3">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                Aplazos (1-5) <span className="bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded text-[10px]">{formData.cantidadAplazos} / 3</span>
                            </label>
                            <div className="flex items-center gap-1">
                                <button onClick={() => cambiarCantidadAplazos(-1)} className="p-1 rounded bg-slate-700 hover:bg-slate-600 text-white disabled:opacity-30" disabled={formData.cantidadAplazos <= 0}><Minus size={14}/></button>
                                <button onClick={() => cambiarCantidadAplazos(1)} className="p-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-30" disabled={formData.cantidadAplazos >= 3}><Plus size={14}/></button>
                            </div>
                        </div>

                        {formData.cantidadAplazos > 0 ? (
                            <div className="grid grid-cols-3 gap-3">
                                {Array.from({ length: formData.cantidadAplazos }).map((_, i) => {
                                    const index = i + 1;
                                    const fieldName = `notaAplazo${index}` as keyof typeof formData;
                                    return (
                                        <div key={index} className="animate-in zoom-in duration-200">
                                            <span className="text-[10px] text-slate-500 font-bold block mb-1 ml-1">Nota {index}</span>
                                            <input 
                                                type="number" min="1" max="5"
                                                value={formData[fieldName]}
                                                onChange={(e) => setFormData({...formData, [fieldName]: e.target.value})}
                                                placeholder="2"
                                                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-center text-red-400 font-bold focus:border-red-500 outline-none"
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center text-slate-600 text-xs py-2 italic">Sin aplazos registrados</div>
                        )}
                    </div>
                    
                    {/* DISPLAY PROMEDIO MATERIA */}
                    {promedioMateriaActual && (
                        <div className="flex items-center justify-between bg-indigo-500/10 border border-indigo-500/30 p-3 rounded-xl animate-in slide-in-from-bottom-2">
                            <span className="text-xs font-bold text-indigo-300 uppercase flex items-center gap-2">
                                <TrendingUp size={14}/> Promedio de esta materia
                            </span>
                            <span className="text-xl font-bold text-white font-mono">{promedioMateriaActual}</span>
                        </div>
                    )}
                </div>

                <div className="p-4 bg-slate-900 border-t border-slate-800 flex gap-3">
                    <button onClick={handleDelete} className="flex-[1] py-3.5 rounded-xl bg-slate-800 text-red-400 hover:bg-red-900/20 font-bold text-sm transition border border-transparent hover:border-red-500/30 flex justify-center items-center gap-2 group">
                        <Trash2 size={16} className="group-hover:scale-110 transition"/>
                    </button>
                    <button onClick={handleSave} className="flex-[4] py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-indigo-500/20">
                        Guardar Cambios
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}