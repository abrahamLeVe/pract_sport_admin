import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      {/* Mantenemos la barra con su variante original */}
      <AppSidebar variant="inset" />

      {/* SidebarInset asegura que el fondo y las curvas cuadren al hacer scroll */}
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
