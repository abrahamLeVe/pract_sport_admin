import * as React from "react";
import Link from "next/link";
import { PlusIcon } from "lucide-react";

import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// 1. Definición estricta del tipo de datos para TypeScript
export type Usuario = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user" | "moderator";
  status: "activo" | "inactivo";
};

// 2. Datos ficticios (Mock Data) provisionales para probar el diseño
const usuariosMock: Usuario[] = [
  {
    id: "1",
    name: "Abraham Leandro",
    email: "abraham@example.com",
    role: "admin",
    status: "activo",
  },
  {
    id: "2",
    name: "Magaly Quispe",
    email: "magaly@example.com",
    role: "moderator",
    status: "activo",
  },
  {
    id: "3",
    name: "Carlos Mendoza",
    email: "carlos@example.com",
    role: "user",
    status: "inactivo",
  },
];

// 3. Configuración de las columnas requeridas por el DataTable de Shadcn
const columns = [
  {
    accessorKey: "name",
    header: "Nombre Completo",
  },
  {
    accessorKey: "email",
    header: "Correo Electrónico",
  },
  {
    accessorKey: "role",
    header: "Rol",
    cell: ({ row }: any) => {
      const role = row.getValue("role");
      return (
        <Badge
          variant={role === "admin" ? "default" : "secondary"}
          className="capitalize"
        >
          {role}
        </Badge>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }: any) => {
      const status = row.getValue("status");
      return (
        <Badge
          variant={status === "activo" ? "outline" : "destructive"}
          className="capitalize"
        >
          {status}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }: any) => {
      const usuario = row.original;
      return (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" asChild>
            <Link href={`/dashboard/usuarios/${usuario.id}`}>Editar</Link>
          </Button>
        </div>
      );
    },
  },
];

// 4. Componente Principal (Server Component por defecto)
export default function UsuariosPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Usuarios</h2>
        <div className="flex items-center space-x-2">
          {/* Botón que apunta a la subcarpeta 'nuevo' para registrar */}
          <Button asChild>
            <Link href="/dashboard/usuarios/nuevo">
              <PlusIcon className="mr-2 h-4 w-4" />
              Nuevo Usuario
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listado General</CardTitle>
          <CardDescription>
            Gestiona los accesos, roles y estados de los usuarios del sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Inyectamos el DataTable de tu repositorio pasándole columnas y filas */}
          {/* <DataTable columns={columns} data={usuariosMock} />} */}
        </CardContent>
      </Card>
    </div>
  );
}
