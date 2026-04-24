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
        {/* SheetJS para leer archivos Excel en el navegador */}
        <Script
          src="https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js"
          strategy="beforeInteractive"
        />
        <style>{`
          /* Texto de todos los inputs, selects y textareas bien visible */
          input, select, textarea {
            color: #1a1a1a !important;
            font-family: inherit;
          }

          /* Placeholder en gris medio — no tan claro que no se vea */
          input::placeholder,
          textarea::placeholder {
            color: #9ca3af;
            opacity: 1;
          }

          /* Select: texto de opciones también oscuro */
          select option {
            color: #1a1a1a;
            background: #fff;
          }

          /* Elimina el fondo azul/amarillo del autofill del navegador */
          input:-webkit-autofill,
          input:-webkit-autofill:hover,
          input:-webkit-autofill:focus {
            -webkit-text-fill-color: #1a1a1a;
            -webkit-box-shadow: 0 0 0px 1000px #fff inset;
            transition: background-color 5000s ease-in-out 0s;
          }

          /* Reset general */
          * { box-sizing: border-box; }
          body { margin: 0; padding: 0; }
        `}</style>
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
