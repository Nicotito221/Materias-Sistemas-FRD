// src/data/materias.ts

export interface Materia {
  id: number;
  nivel: number;
  nombre: string;
  correlativasCursada: number[]; 
  correlativasAprobada: number[]; 
}

export const PLAN_ESTUDIOS: Materia[] = [
  // --- 1° AÑO ---
  { id: 1, nivel: 1, nombre: "Análisis Matemático 1", correlativasCursada: [], correlativasAprobada: [] },
  { id: 2, nivel: 1, nombre: "Álgebra y Geometría Analítica", correlativasCursada: [], correlativasAprobada: [] },
  { id: 3, nivel: 1, nombre: "Física 1", correlativasCursada: [], correlativasAprobada: [] },
  { id: 4, nivel: 1, nombre: "Inglés 1", correlativasCursada: [], correlativasAprobada: [] },
  { id: 5, nivel: 1, nombre: "Lógica y Estructuras Discretas", correlativasCursada: [], correlativasAprobada: [] },
  { id: 6, nivel: 1, nombre: "Algoritmos y Estructuras de Datos", correlativasCursada: [], correlativasAprobada: [] },
  { id: 7, nivel: 1, nombre: "Arquitectura de Computadoras", correlativasCursada: [], correlativasAprobada: [] },
  { id: 8, nivel: 1, nombre: "Sistemas y Procesos de Negocio", correlativasCursada: [], correlativasAprobada: [] },

  // --- 2° AÑO ---
  { id: 9, nivel: 2, nombre: "Análisis Matemático 2", correlativasCursada: [1, 2], correlativasAprobada: [] },
  { id: 10, nivel: 2, nombre: "Física 2", correlativasCursada: [1, 3], correlativasAprobada: [] },
  { id: 11, nivel: 2, nombre: "Ingeniería y Sociedad", correlativasCursada: [], correlativasAprobada: [] },
  { id: 12, nivel: 2, nombre: "Inglés 2", correlativasCursada: [], correlativasAprobada: [] },
  { id: 13, nivel: 2, nombre: "Sintaxis y Semántica de los Lenguajes", correlativasCursada: [5, 6], correlativasAprobada: [] },
  { id: 14, nivel: 2, nombre: "Paradigmas de Programación", correlativasCursada: [5, 6], correlativasAprobada: [] },
  { id: 15, nivel: 2, nombre: "Sistemas Operativos", correlativasCursada: [7], correlativasAprobada: [] },
  { id: 16, nivel: 2, nombre: "Análisis de Sistemas de Información (Int.)", correlativasCursada: [6, 8], correlativasAprobada: [] },

  // --- 3° AÑO ---
  { id: 17, nivel: 3, nombre: "Probabilidades y Estadísticas", correlativasCursada: [1, 2], correlativasAprobada: [] },
  { id: 18, nivel: 3, nombre: "Economía", correlativasCursada: [], correlativasAprobada: [1, 2] },
  { id: 19, nivel: 3, nombre: "Bases de Datos", correlativasCursada: [13, 16], correlativasAprobada: [5, 6] },
  { id: 20, nivel: 3, nombre: "Desarrollo de Software", correlativasCursada: [14, 16], correlativasAprobada: [5, 6] },
  { id: 21, nivel: 3, nombre: "Comunicación de Datos", correlativasCursada: [], correlativasAprobada: [3, 7] },
  { id: 22, nivel: 3, nombre: "Análisis Numérico", correlativasCursada: [9], correlativasAprobada: [1, 2] },
  { id: 23, nivel: 3, nombre: "Diseño de Sistemas de Información (Int.)", correlativasCursada: [14, 16], correlativasAprobada: [4, 6, 8] },

  // --- 4° AÑO ---
  { id: 24, nivel: 4, nombre: "Legislación", correlativasCursada: [11], correlativasAprobada: [] },
  { id: 25, nivel: 4, nombre: "Ingeniería y Calidad de Software", correlativasCursada: [19, 20, 23], correlativasAprobada: [13, 14] },
  { id: 26, nivel: 4, nombre: "Redes de Datos", correlativasCursada: [15, 21], correlativasAprobada: [] },
  { id: 27, nivel: 4, nombre: "Investigación Operativa", correlativasCursada: [17, 22], correlativasAprobada: [] },
  { id: 28, nivel: 4, nombre: "Simulación", correlativasCursada: [17], correlativasAprobada: [9] },
  { id: 29, nivel: 4, nombre: "Tecnologías para la automatización", correlativasCursada: [10, 22], correlativasAprobada: [9] },
  { id: 30, nivel: 4, nombre: "Adm. Sistemas Información (Int.)", correlativasCursada: [18, 23], correlativasAprobada: [16] },

  // --- 5° AÑO ---
  { id: 31, nivel: 5, nombre: "Inteligencia Artificial", correlativasCursada: [28], correlativasAprobada: [17, 22] },
  { id: 32, nivel: 5, nombre: "Ciencia de Datos", correlativasCursada: [28], correlativasAprobada: [17, 19] },
  { id: 33, nivel: 5, nombre: "Sistemas de Gestión", correlativasCursada: [18, 27], correlativasAprobada: [23] },
  { id: 34, nivel: 5, nombre: "Gestión Gerencial", correlativasCursada: [24, 30], correlativasAprobada: [18] },
  { id: 35, nivel: 5, nombre: "Seguridad en los Sistemas de Información", correlativasCursada: [26, 30], correlativasAprobada: [20, 21] },
  { id: 36, nivel: 5, nombre: "Proyecto Final (integrador)", correlativasCursada: [25, 26, 30], correlativasAprobada: [12, 20, 23] },
];