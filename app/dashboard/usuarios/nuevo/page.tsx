"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeftIcon, Loader2Icon } from "lucide-react";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { registrarUsuarioAction } from "@/app/actions/usuarios";
import { SiteHeader } from "@/components/site-header";

export default function NuevoUsuarioPage() {
  //useActionState maneja el flujo nativo del servidor sin usar useEffect
  const [state, formAction, isPending] = useActionState(
    registrarUsuarioAction,
    null,
  );

  return (
    <>
      <SiteHeader />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6 max-w-2xl mx-auto w-full">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild disabled={isPending}>
                <Link href="/dashboard/usuarios">
                  <ArrowLeftIcon className="mr-2 h-4 w-4" />
                  Volver al listado
                </Link>
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Registrar Miembro - Inka Team</CardTitle>
                <CardDescription>
                  Agrega un nuevo usuario al sistema especificando sus accesos y
                  privilegios.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form action={formAction} className="space-y-4">
                  {/* Campo: Nombre */}
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre Completo</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Ej. Juan Pérez"
                      disabled={isPending}
                      defaultValue={state?.fields?.name?.value || ""}
                      autoComplete="name"
                    />
                    {state?.fields?.name?.message && (
                      <p className="text-xs font-medium text-destructive">
                        {state.fields.name.message}
                      </p>
                    )}
                  </div>

                  {/* Campo: Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Correo Electrónico</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="juan@inkateam.com"
                      disabled={isPending}
                      defaultValue={state?.fields?.email?.value || ""}
                      autoComplete="email"
                    />
                    {state?.fields?.email?.message && (
                      <p className="text-xs font-medium text-destructive">
                        {state.fields.email.message}
                      </p>
                    )}
                  </div>

                  {/* Campo: Password */}
                  <div className="space-y-2">
                    <Label htmlFor="password">Contraseña Temporal</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      disabled={isPending}
                      defaultValue={state?.fields?.password?.value || ""}
                    />
                    {state?.fields?.password?.message && (
                      <p className="text-xs font-medium text-destructive">
                        {state.fields.password.message}
                      </p>
                    )}
                  </div>

                  {/* Campo: Rol de Permisos */}
                  <div className="space-y-2">
                    <Label htmlFor="role">Rol / Permisos del Sistema</Label>
                    <Select
                      name="role"
                      key={state?.fields?.role?.value || "user"}
                      defaultValue={state?.fields?.role?.value || "user"}
                      disabled={isPending}
                    >
                      <SelectTrigger id="role">
                        <SelectValue placeholder="Selecciona un rol" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">
                          Usuario / Competidor
                        </SelectItem>
                        <SelectItem value="moderator">
                          Moderador / Staff
                        </SelectItem>
                        <SelectItem value="admin">
                          Administrador Total
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {state?.fields?.role?.message && (
                      <p className="text-xs font-medium text-destructive">
                        {state.fields.role.message}
                      </p>
                    )}
                  </div>

                  {/* Error global */}
                  {state?.error && (
                    <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm font-medium">
                      {state.error}
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      asChild
                      disabled={isPending}
                    >
                      <Link href="/dashboard/usuarios">Cancelar</Link>
                    </Button>

                    {/* 🛠️ BOTÓN OPTIMIZADO: Mantiene el spinner continuo */}
                    <Button
                      type="submit"
                      disabled={isPending}
                      className="min-w-35 flex items-center justify-center gap-2"
                    >
                      {isPending ? (
                        <>
                          <Loader2Icon className="h-4 w-4 animate-spin" />
                          <span>Guardando...</span>
                        </>
                      ) : (
                        <span>Guardar Usuario</span>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
