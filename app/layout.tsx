import type { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "MailStudio — Email Marketing",
  description: "Sistema de email marketing con Brevo",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        {/* SheetJS para leer archivos Excel (.xlsx, .xls) en el navegador */}
        <Script
          src="https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js"
          strategy="beforeInteractive"
        />
      </head>
      <body style={{ margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  );
}
