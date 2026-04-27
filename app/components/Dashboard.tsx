"use client";
// app/components/Dashboard.tsx

import { Config, Campaign } from "./types";
import { Icon, icons, statusBadge, Card } from "./ui";
import { emailTemplates } from "./emailTemplates";

export default function Dashboard({
  config,
  campaigns,
}: {
  config: Config;
  campaigns: Campaign[];
}) {
  const steps = [
    { done: true,                 label: "Proyecto desplegado en Vercel" },
    { done: true,                 label: "API Key de Brevo configurada" },
    { done: !!config.senderEmail, label: "Email remitente verificado" },
    { done: false,                label: "Contactos importados y listos" },
    { done: false,                label: "Primera campaña enviada" },
  ];
  const done = steps.filter((s) => s.done).length;

  return (
    <div style={{ animation: "fadeIn 0.5s ease-out" }}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      
      <div style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: 36, fontWeight: 700, margin: "0 0 8px", color: "#1a1a1a" }}>
          Panel de Control
        </h2>
        <p style={{ color: "#C5A073", margin: 0, fontWeight: 500, letterSpacing: 0.5 }}>
          Bienvenida a tu estudio de marketing digital
        </p>
      </div>

      {/* Stats Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
          gap: 24,
          marginBottom: 40,
        }}
      >
        {[
          { l: "Campañas",   v: String(campaigns.length),       s: "enviadas", i: "send" },
          { l: "Plantillas", v: String(emailTemplates.length),   s: "disponibles", i: "template" },
          { l: "Remitente",  v: config.senderEmail ? "Activo" : "—", s: config.senderEmail || "Sin configurar", i: "mail" },
          { l: "Estado API", v: "Conectado",                    s: "Brevo API v3", i: "check" },
        ].map(({ l, v, s, i }) => (
          <Card key={l} padding={24} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#C5A073", textTransform: "uppercase", letterSpacing: 1.5 }}>{l}</span>
              <div style={{ padding: 8, background: "rgba(197, 160, 115, 0.1)", borderRadius: 10 }}>
                <Icon d={icons[i]} size={16} stroke color="#C5A073" />
              </div>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 32, fontWeight: 800, color: "#1a1a1a", letterSpacing: -1 }}>
                {v}
              </p>
              <p style={{ margin: "4px 0 0", fontSize: 12, color: "#999", fontWeight: 500 }}>{s}</p>
            </div>
          </Card>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 24 }}>
        {/* Recent Activity */}
        <Card title="Actividad Reciente">
          <h3 style={{ fontSize: 18, margin: "0 0 24px", color: "#1a1a1a" }}>Actividad Reciente</h3>
          {campaigns.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {campaigns.slice(0, 5).map((c) => (
                <div
                  key={c.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "16px",
                    background: "rgba(255,255,255,0.4)",
                    borderRadius: 16,
                    border: "1px solid rgba(197, 160, 115, 0.05)",
                  }}
                >
                  <div>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#1a1a1a" }}>{c.name}</p>
                    <p style={{ margin: "2px 0 0", fontSize: 11, color: "#999" }}>{c.date}</p>
                  </div>
                  {statusBadge(c.status)}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#ccc" }}>
              <Icon d={icons.mail} size={48} stroke color="rgba(197, 160, 115, 0.1)" />
              <p style={{ marginTop: 12, fontSize: 14 }}>No hay campañas recientes</p>
            </div>
          )}
        </Card>

        {/* Setup Progress */}
        <Card style={{ background: "linear-gradient(135deg, #1a1a1a 0%, #333 100%)", border: "none" }}>
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 18, margin: "0 0 4px", color: "#FBF8F3" }}>Configuración</h3>
            <p style={{ fontSize: 12, color: "rgba(251, 248, 243, 0.5)", margin: 0 }}>
              {done} de {steps.length} pasos completados
            </p>
          </div>

          <div style={{ 
            background: "rgba(255,255,255,0.05)", 
            borderRadius: 20, 
            height: 6, 
            marginBottom: 32,
            overflow: "hidden" 
          }}>
            <div style={{
              background: "linear-gradient(90deg, #C5A073 0%, #E8E4DC 100%)",
              height: "100%",
              width: `${(done / steps.length) * 100}%`,
              transition: "width 1s cubic-bezier(0.4, 0, 0.2, 1)",
              boxShadow: "0 0 15px rgba(197, 160, 115, 0.5)"
            }} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {steps.map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, opacity: s.done ? 0.5 : 1 }}>
                <div style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  background: s.done ? "#C5A073" : "transparent",
                  border: `2px solid ${s.done ? "#C5A073" : "rgba(255,255,255,0.1)"}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0
                }}>
                  {s.done && <Icon d={icons.check} size={10} stroke color="#1a1a1a" />}
                </div>
                <span style={{ 
                  fontSize: 13, 
                  color: s.done ? "#FBF8F3" : "rgba(251, 248, 243, 0.8)",
                  fontWeight: s.done ? 400 : 500,
                  textDecoration: s.done ? "line-through" : "none" 
                }}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
