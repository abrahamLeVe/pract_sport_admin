"use client";

import { Loader2Icon } from "lucide-react";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

import { loginUsuarioAction } from "@/app/actions/usuarios";

interface PageProps {
  className?: string;
}

export default function Home({ className }: PageProps) {
  const [state, formAction, isPending] = useActionState(
    loginUsuarioAction,
    null,
  );

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black p-4">
      <main className="flex w-full max-w-4xl flex-col items-center justify-center bg-white dark:bg-zinc-950 rounded-xl shadow-sm border border-zinc-200/50 dark:border-zinc-800/50 overflow-hidden">
        <div className={cn("flex flex-col gap-6 w-full", className)}>
          <Card className="overflow-hidden p-0 border-0 shadow-none">
            <CardContent className="grid p-0 md:grid-cols-2">
              {/* Formulario de Autenticación */}
              <form
                action={formAction}
                className="p-6 md:p-10 flex flex-col justify-center"
              >
                <div className="space-y-6">
                  <div className="flex flex-col items-center gap-2 text-center mb-2">
                    <h1 className="text-2xl font-bold tracking-tight">
                      ¡Bienvenido a Inka Team!
                    </h1>
                    <p className="text-sm text-balance text-muted-foreground">
                      Ingresa tus credenciales para acceder al panel
                      administrativo
                    </p>
                  </div>

                  {/* Campo: Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Correo Electrónico</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="m@example.com"
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
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Contraseña</Label>
                    </div>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      disabled={isPending}
                      autoComplete="current-password"
                    />
                    {state?.fields?.password?.message && (
                      <p className="text-xs font-medium text-destructive">
                        {state.fields.password.message}
                      </p>
                    )}
                  </div>

                  {/* Mensaje de error global si rebota en la DB */}
                  {state?.error && (
                    <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm font-medium">
                      {state.error}
                    </div>
                  )}

                  {/* Botón de Envío con Centrado de Loader */}
                  <Button
                    type="submit"
                    className="w-full relative"
                    disabled={isPending}
                  >
                    {isPending && (
                      <div className="absolute inset-0 flex items-center justify-center bg-primary rounded-md">
                        <Loader2Icon className="h-4 w-4 animate-spin text-primary-foreground" />
                      </div>
                    )}
                    <span className={isPending ? "text-transparent" : ""}>
                      Iniciar Sesión
                    </span>
                  </Button>
                </div>
              </form>

              {/* Imagen Lateral de la Academia */}
              <div className="relative hidden bg-muted md:block h-full min-h-125">
                <img
                  src="/placeholder.png"
                  alt="Inka Team Sparring"
                  className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.3] dark:grayscale"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
