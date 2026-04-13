import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import ServiceWorkerRegister from "./components/ServiceWorkerRegister";
import InstallPWA from "./components/InstallPWA";
export const metadata: Metadata = {
  title: "NovoBanco — Simulador Bancario",
  description: "Tu banco digital moderno",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "NovoBanco",
  },
  icons: {
    icon: "/icons/logo.svg",
    apple: "/icons/logo.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#7c6aff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          <ServiceWorkerRegister />
          <InstallPWA />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}