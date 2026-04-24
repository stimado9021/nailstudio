"use client";
// app/components/Dashboard.tsx

import { Config, Campaign } from "./types";
import { Icon, icons, statusBadge } from "./ui";
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
    { done: !!config.senderEmail, label: "Email remitente configurado" },
    { done: false,                label: "Contactos subidos a Brevo" },
    { done: false,                label: "Primera campaña enviada" },
  ];
  const done = steps.filter((s) => s.done).length;

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontFamily: "Georgia, serif", fontSize: 28, margin: "0 0 4px" }}>
          Panel de control
        </h2>
        <p style={{ color: "#888", margin: 0 }}>
          MailStudio · Email Marketing con Brevo API
        </p>
      </div>

      {/* Checklist */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #e8e4dc",
          borderRadius: 12,
          padding: 28,
          marginBottom: 24,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <h3 style={{ fontFamily: "Georgia, serif", fontSize: 18, margin: 0 }}>
            Checklist de configuración
          </h3>
          <span style={{ fontSize: 13, color: "#888" }}>
            {done}/{steps.length} completados
          </span>
        </div>

        {/* Barra de progreso */}
        <div
          style={{
            background: "#f0ede6",
            borderRadius: 20,
            height: 8,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              background: "#1a1a1a",
              height: 8,
              borderRadius: 20,
              width: `${(done / steps.length) * 100}%`,
              transition: "width 0.5s",
            }}
          />
        </div>

        {steps.map((s, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              marginBottom: 12,
            }}
          >
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: "50%",
                background: s.done ? "#dcfce7" : "#f8f6f2",
                border: `2px solid ${s.done ? "#166534" : "#e8e4dc"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {s.done ? (
                <Icon d={icons.check} size={13} stroke color="#166534" />
              ) : (
                <span style={{ fontSize: 11, color: "#ccc" }}>{i + 1}</span>
              )}
            </div>
            <p
              style={{
                margin: 0,
                fontSize: 14,
                fontWeight: s.done ? 400 : 600,
                color: s.done ? "#aaa" : "#1a1a1a",
                textDecoration: s.done ? "line-through" : "none",
              }}
            >
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        {[
          { l: "CAMPAÑAS",   v: String(campaigns.length),       s: "creadas" },
          { l: "PLANTILLAS", v: String(emailTemplates.length),   s: "listas para usar" },
          { l: "REMITENTE",  v: config.senderEmail ? "✓" : "—", s: config.senderEmail || "Ve a Configuración" },
          { l: "API BREVO",  v: "Activa",                        s: "via variable de entorno" },
        ].map(({ l, v, s }) => (
          <div
            key={l}
            style={{
              background: "#fff",
              border: "1px solid #e8e4dc",
              borderRadius: 12,
              padding: "20px 24px",
            }}
          >
            <p style={{ margin: 0, fontSize: 11, color: "#aaa", fontFamily: "monospace", letterSpacing: 1 }}>
              {l}
            </p>
            <p style={{ margin: "8px 0 4px", fontSize: 26, fontWeight: 800, color: "#1a1a1a", fontFamily: "Georgia, serif" }}>
              {v}
            </p>
            <p style={{ margin: 0, fontSize: 12, color: "#aaa" }}>{s}</p>
          </div>
        ))}
      </div>

      {/* Campañas recientes */}
      {campaigns.length > 0 && (
        <div
          style={{
            background: "#fff",
            border: "1px solid #e8e4dc",
            borderRadius: 12,
            padding: 24,
          }}
        >
          <h3 style={{ fontFamily: "Georgia, serif", fontSize: 18, margin: "0 0 20px" }}>
            Campañas recientes
          </h3>
          {campaigns.slice(0, 5).map((c) => (
            <div
              key={c.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px 0",
                borderBottom: "1px solid #f8f6f2",
              }}
            >
              <div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{c.name}</p>
                <p style={{ margin: 0, fontSize: 12, color: "#aaa" }}>{c.date}</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {c.brevoId && (
                  <span style={{ fontSize: 11, color: "#aaa", fontFamily: "monospace" }}>
                    ID: {c.brevoId}
                  </span>
                )}
                {statusBadge(c.status)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
