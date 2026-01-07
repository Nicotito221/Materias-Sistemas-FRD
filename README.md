# 🎓 Sistema de Correlatividades Académicas (Skill Tree especificamente para la carrera de Ingeniería en Sistemas - UTN FRD)

Una aplicación web moderna diseñada para visualizar y gestionar el plan de estudios universitario mediante un **grafo interactivo de nodos**. Este sistema permite a los estudiantes llevar un seguimiento detallado de su progreso académico, entendiendo visualmente qué materias desbloquean a cuáles, similar a un árbol de habilidades en juegos.

## 🚀 Características Principales

-   **Visualización de Grafo (React Flow):** Las materias se organizan automáticamente por niveles y conexiones.
-   **Lógica de Correlatividades:**
    -   🔒 **Bloqueada:** Gris (Faltan correlativas).
    -   🔵 **Habilitada:** Azul pulsante (Lista para cursar).
    -   🟡 **Regularizada:** Amarillo (Cursada aprobada, falta final).
    -   🟢 **Aprobada:** Verde (Materia completada).
-   **Gestión de Notas y Aplazos:**
    -   Validación estricta de notas de aprobación (6-10).
    -   Registro de hasta 3 aplazos con sus notas (1-5).
-   **Cálculo Automático de Promedios:**
    -   **Promedio General:** Incluye notas finales y aplazos (fórmula académica estándar).
    -   **Promedio por Materia:** Calcula el rendimiento específico en cada asignatura.
-   **Interfaz Moderna:** Diseño "Dark Mode" con Tailwind CSS, glassmorphism y animaciones fluidas.
-   **Persistencia de Datos:** Base de datos SQL mediante Prisma ORM y autenticación simple por email.

## 🛠️ Stack Tecnológico

-   **Frontend:** [Next.js 14](https://nextjs.org/) (App Router), [React](https://react.dev/).
-   **Estilos:** [Tailwind CSS](https://tailwindcss.com/), [Lucide React](https://lucide.dev/) (Iconos).
-   **Visualización:** [React Flow](https://reactflow.dev/), [Dagre](https://github.com/dagrejs/dagre) (Algoritmo de ordenamiento).
-   **Backend & DB:** [Prisma ORM](https://www.prisma.io/), SQLite (Entorno de desarrollo), API Routes de Next.js.


> **Promedio General** = (Suma de notas de aprobación + Suma de notas de aplazos) / (Cantidad total de exámenes rendidos)


---
Desarrollado con ❤️ usando Next.js.
