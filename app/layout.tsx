import type { Metadata } from "next";
import Script from "next/script";
import { Outfit, Playfair_Display } from "next/font/google";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MailStudio — Premium Email Marketing",
  description: "Sistema de email marketing con estética premium",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${outfit.variable} ${playfair.variable}`}>
      <head>
        {/* SheetJS para leer archivos Excel en el navegador */}
        <Script
          src="https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js"
          strategy="beforeInteractive"
        />
        <style>{`
          :root {
            --primary: #1a1a1a;
            --accent: #C5A073;
            --bg: #FBF8F3;
            --card-bg: rgba(255, 255, 255, 0.7);
            --border: rgba(197, 160, 115, 0.15);
          }

          body {
            margin: 0;
            padding: 0;
            background-color: var(--bg);
            color: var(--primary);
            font-family: var(--font-outfit), sans-serif;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }

          h1, h2, h3, h4 {
            font-family: var(--font-playfair), serif;
          }

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
          
          /* Custom Scrollbar for Premium Feel */
          ::-webkit-scrollbar {
            width: 8px;
          }
          ::-webkit-scrollbar-track {
            background: #f1f1f1;
          }
          ::-webkit-scrollbar-thumb {
            background: #d1d1d1;
            border-radius: 10px;
          }
          ::-webkit-scrollbar-thumb:hover {
            background: var(--accent);
          }
        `}</style>
      </head>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
