// app/api/competencias/route.ts (En tu proyecto Admin)
import { NextResponse } from "next/server";
import { query } from "@/lib/db"; // Tu conexión a Postgres

export async function GET() {
  try {
    const res = await query(
      "SELECT id, nombre, fecha_evento, precio_inscripcion FROM competencias WHERE status = 'abierto'",
    );
    return NextResponse.json(res.rows);
  } catch (error) {
    return NextResponse.json(
      { error: "Error al obtener competencias" },
      { status: 500 },
    );
  }
}
