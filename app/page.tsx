"use client";
// app/page.tsx — estado global compartido entre módulos

import { useState, useEffect } from "react";
import { Config, Campaign, ToastState, BrevoList } from "./components/types";
import { Icon, icons, Toast } from "./components/ui";
import Dashboard  from "./components/Dashboard";
import Contacts   from "./components/Contacts";
import Campaigns  from "./components/Campaigns";
import Templates  from "./components/Templates";
import Settings   from "./components/Settings";

const nav = [
  { id: "dashboard", label: "Panel",        icon: "chart" },
  { id: "campaigns", label: "Campañas",      icon: "send" },
  { id: "contacts",  label: "Contactos",     icon: "users" },
  { id: "templates", label: "Plantillas",    icon: "template" },
  { id: "settings",  label: "Configuración", icon: "settings" },
];

export default function App() {
  const [page, setPage]             = useState("dashboard");
  const [campaigns, setCampaigns]   = useState<Campaign[]>([]);
  const [config, setConfig]         = useState<Config>({ senderName: "", senderEmail: "", replyTo: "" });
  const [toastState, setToastState] = useState<ToastState | null>(null);

  // ── Estado compartido: listas de Brevo disponibles tras subir contactos ──
  const [brevoLists, setBrevoLists] = useState<BrevoList[]>([]);

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

  // Cuando Contacts sube una lista a Brevo, la registra aquí
  // para que Campaigns la pueda usar directamente
  const onListCreated = (list: BrevoList) => {
    setBrevoLists(p => {
      const exists = p.find(l => l.id === list.id);
      return exists ? p : [...p, list];
    });
  };

  return (
    <div style={{ minHeight: "100vh", background: "#FBF8F3", display: "flex", fontFamily: "var(--font-outfit), sans-serif" }}>
      {toastState && <Toast msg={toastState.msg} ok={toastState.ok} onClose={() => setToastState(null)} />}

      {/* Sidebar */}
      <aside style={{ 
        width: 260, 
        background: "rgba(26, 26, 26, 0.95)", 
        backdropFilter: "blur(12px)",
        display: "flex", 
        flexDirection: "column", 
        position: "fixed", 
        top: 0, 
        left: 0, 
        bottom: 0, 
        zIndex: 100,
        borderRight: "1px solid rgba(197, 160, 115, 0.1)"
      }}>
        <div style={{ padding: "40px 32px 30px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <div style={{ 
              width: 36, 
              height: 36, 
              background: "linear-gradient(135deg, #C5A073 0%, #E8E4DC 100%)", 
              borderRadius: 10, 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(197, 160, 115, 0.3)"
            }}>
              <Icon d={icons.mail} size={18} stroke color="#1a1a1a" />
            </div>
            <span style={{ 
              color: "#FBF8F3", 
              fontSize: 20, 
              fontWeight: 800, 
              fontFamily: "var(--font-playfair), serif",
              letterSpacing: -0.5 
            }}>MailStudio</span>
          </div>
          <p style={{ color: "rgba(197, 160, 115, 0.6)", fontSize: 10, margin: 0, letterSpacing: 2, fontWeight: 700, textTransform: "uppercase" }}>Email Marketing</p>
        </div>

        <nav style={{ flex: 1, padding: "12px 16px" }}>
          {nav.map(n => (
            <button key={n.id} onClick={() => setPage(n.id)}
              style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: 12, 
                width: "100%", 
                padding: "12px 16px", 
                borderRadius: 12, 
                border: "none", 
                cursor: "pointer", 
                fontSize: 14, 
                fontWeight: page === n.id ? 700 : 500, 
                fontFamily: "inherit", 
                textAlign: "left", 
                marginBottom: 6, 
                background: page === n.id ? "rgba(197, 160, 115, 0.15)" : "transparent", 
                color: page === n.id ? "#C5A073" : "rgba(251, 248, 243, 0.5)", 
                transition: "all 0.3s ease" 
              }}>
              <Icon d={icons[n.icon]} size={18} stroke color={page === n.id ? "#C5A073" : "rgba(251, 248, 243, 0.3)"} />
              {n.label}
            </button>
          ))}
        </nav>

        <div style={{ padding: "24px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ 
            background: "rgba(255,255,255,0.03)", 
            borderRadius: 16, 
            padding: "16px",
            border: "1px solid rgba(255,255,255,0.05)" 
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: config.senderEmail ? "#4ade80" : "#f87171", boxShadow: `0 0 10px ${config.senderEmail ? "#4ade80" : "#f87171"}` }} />
              <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, margin: 0, fontWeight: 600 }}>Estado</p>
            </div>
            {config.senderEmail ? (
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, margin: 0, fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis" }}>
                {config.senderEmail}
              </p>
            ) : (
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, margin: 0 }}>Pendiente de configurar</p>
            )}
          </div>
        </div>
      </aside>

      {/* Contenido */}
      <main style={{ marginLeft: 260, flex: 1, padding: "60px 80px", minHeight: "100vh" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          {page === "dashboard" && <Dashboard config={config} campaigns={campaigns} />}
          {page === "campaigns" && (
            <Campaigns
              config={config}
              toast={toast}
              campaigns={campaigns}
              setCampaigns={setCampaigns}
              brevoLists={brevoLists}
            />
          )}
          {page === "contacts"  && <Contacts toast={toast} onListCreated={onListCreated} />}
          {page === "templates" && <Templates />}
          {page === "settings"  && <Settings config={config} setConfig={setConfig} toast={toast} />}
        </div>
      </main>
    </div>
  );
}
