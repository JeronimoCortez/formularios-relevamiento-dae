// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Relevamiento Provincial | Ministerio de Educación Mendoza",
  description:
    "Operativo Territorial de Responsabilidad Parental, Acuerdos de Convivencia y Seguridad Integral",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="antialiased">{children}</body>
    </html>
  );
}