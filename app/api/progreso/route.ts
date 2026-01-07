// src/app/api/progreso/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) return NextResponse.json([], { status: 400 });

  try {
    const progreso = await prisma.materiaProgreso.findMany({
      where: { userId },
    });
    return NextResponse.json(progreso);
  } catch (error) {
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Desestructuramos los nuevos campos
    const { 
      userId, materiaId, action, 
      nota, estado, aplazos, 
      notaAplazo1, notaAplazo2, notaAplazo3 
    } = body;

    if (!userId || !materiaId) return NextResponse.json({ error: "Faltan datos" }, { status: 400 });

    if (action === 'delete') {
      await prisma.materiaProgreso.deleteMany({
        where: { userId, materiaId }
      });
    } else {
      // Datos a guardar
      const dataToSave = {
        userId, 
        materiaId, 
        estado,
        nota: nota ? parseFloat(nota) : null, 
        aplazos: parseInt(aplazos || '0'),
        notaAplazo1: notaAplazo1 ? parseFloat(notaAplazo1) : null,
        notaAplazo2: notaAplazo2 ? parseFloat(notaAplazo2) : null,
        notaAplazo3: notaAplazo3 ? parseFloat(notaAplazo3) : null,
      };

      await prisma.materiaProgreso.upsert({
        where: { userId_materiaId: { userId, materiaId } },
        update: { ...dataToSave, userId: undefined, materiaId: undefined }, // En update no repetimos IDs únicos
        create: dataToSave,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error DB:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}