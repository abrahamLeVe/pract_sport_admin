import * as React from "react";
import Link from "next/link";
import { PlusIcon } from "lucide-react";

import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export type Usuario = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user" | "moderator";
  status: "activo" | "inactivo";
};

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

const columns = [
  { accessorKey: "name", header: "Nombre Completo" },
  { accessorKey: "email", header: "Correo Electrónico" },
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
        <Button size="sm" variant="outline" asChild>
          <Link href={`/dashboard/usuarios/${usuario.id}`}>Editar</Link>
        </Button>
      );
    },
  },
];

export default function UsuariosPage() {
  return (
    <>
      <SiteHeader />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
            <div className="flex items-center justify-between space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">Usuarios</h2>
              <Button asChild>
                <Link href="/dashboard/usuarios/nuevo">
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Nuevo Usuario
                </Link>
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Listado General</CardTitle>
                <CardDescription>
                  Gestiona los accesos, roles y estados de los usuarios del
                  sistema.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* <DataTable columns={columns} data={usuariosMock} /> */}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
