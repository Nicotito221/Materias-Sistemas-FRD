import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // <--- CAMBIO IMPORTANTE: Importar desde tu nuevo archivo

// Borra la línea: const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email requerido" }, { status: 400 });
    }

    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: { 
          email,
          name: email.split('@')[0] 
        },
      });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error en login:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}