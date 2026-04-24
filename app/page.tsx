"use client";
// app/page.tsx
// Ensamblador principal — solo importa módulos y maneja navegación + estado global

import { useState, useEffect } from "react";
import { Config, Campaign, ToastState } from "./components/types";
import { Icon, icons, Toast } from "./components/ui";
import Dashboard  from "./components/Dashboard";
import Contacts   from "./components/Contacts";
import Campaigns  from "./components/Campaigns";
import Templates  from "./components/Templates";
import Settings   from "./components/Settings";

// ── Navegación ────────────────────────────────────────────────────────────────
const nav = [
  { id: "dashboard", label: "Panel",        icon: "chart" },
  { id: "campaigns", label: "Campañas",      icon: "send" },
  { id: "contacts",  label: "Contactos",     icon: "users" },
  { id: "templates", label: "Plantillas",    icon: "template" },
  { id: "settings",  label: "Configuración", icon: "settings" },
];

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage]   = useState("dashboard");
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [config, setConfig] = useState<Config>({
    senderName: "",
    senderEmail: "",
    replyTo: "",
  });
  const [toastState, setToastState] = useState<ToastState | null>(null);

  // Carga config guardada solo en el cliente (evita error de hidratación Next.js)
  useEffect(() => {
    try {
      const saved = localStorage.getItem("mailstudio_config");
      if (saved) setConfig(JSON.parse(saved));
    } catch {}
  }, []);

  const toast = (msg: string, ok = true) => {
    setToastState({ msg, ok });
    setTimeout(() => setToastState(null), 5000);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8f5ef",
        display: "flex",
        fontFamily: "'Palatino Linotype', Georgia, serif",
      }}
    >
      {/* Toast global */}
      {toastState && (
        <Toast msg={toastState.msg} ok={toastState.ok} onClose={() => setToastState(null)} />
      )}

      {/* ── Sidebar ── */}
      <aside
        style={{
          width: 224,
          background: "#1a1a1a",
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          top: 0, left: 0, bottom: 0,
          zIndex: 100,
        }}
      >
        {/* Logo */}
        <div style={{ padding: "28px 24px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <div
              style={{
                width: 30, height: 30,
                background: "#f5f0e8",
                borderRadius: 7,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <Icon d={icons.mail} size={16} stroke color="#1a1a1a" />
            </div>
            <span style={{ color: "#f5f0e8", fontSize: 16, fontWeight: 800, letterSpacing: 0.5 }}>
              MailStudio
            </span>
          </div>
          <p style={{ color: "#555", fontSize: 10, margin: 0, letterSpacing: 2, fontFamily: "monospace" }}>
            EMAIL MARKETING
          </p>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "8px 12px" }}>
          {nav.map((n) => (
            <button
              key={n.id}
              onClick={() => setPage(n.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: page === n.id ? 700 : 400,
                fontFamily: "inherit",
                textAlign: "left",
                marginBottom: 3,
                background: page === n.id ? "rgba(245,240,232,0.13)" : "transparent",
                color: page === n.id ? "#f5f0e8" : "#777",
                transition: "all 0.15s",
              }}
            >
              <Icon
                d={icons[n.icon]}
                size={16}
                stroke
                color={page === n.id ? "#f5f0e8" : "#555"}
              />
              {n.label}
            </button>
          ))}
        </nav>

        {/* Estado Brevo */}
        <div style={{ padding: "16px 20px", borderTop: "1px solid #222" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <div
              style={{
                width: 8, height: 8,
                borderRadius: "50%",
                background: config.senderEmail ? "#4ade80" : "#f87171",
                flexShrink: 0,
              }}
            />
            <p style={{ color: "#666", fontSize: 12, margin: 0 }}>
              {config.senderEmail ? "Brevo configurado" : "Sin configurar"}
            </p>
          </div>
          {config.senderEmail && (
            <p
              style={{
                color: "#444",
                fontSize: 11,
                margin: 0,
                fontFamily: "monospace",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {config.senderEmail}
            </p>
          )}
        </div>
      </aside>

      {/* ── Contenido principal ── */}
      <main
        style={{
          marginLeft: 224,
          flex: 1,
          padding: "40px 48px",
          minHeight: "100vh",
        }}
      >
        {page === "dashboard" && <Dashboard config={config} campaigns={campaigns} />}
        {page === "campaigns" && <Campaigns config={config} toast={toast} />}
        {page === "contacts"  && <Contacts toast={toast} />}
        {page === "templates" && <Templates />}
        {page === "settings"  && <Settings config={config} setConfig={setConfig} toast={toast} />}
      </main>
    </div>
  );
}
