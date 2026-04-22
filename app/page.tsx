"use client";

import { useState, useRef, useEffect } from "react";

// ── icons ────────────────────────────────────────────────────────────────────
const Icon = ({ d, size = 20, color = "currentColor", stroke = false }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={stroke ? "none" : color}
    stroke={stroke ? color : "none"} strokeWidth={stroke ? 2 : 0}>
    <path d={d} strokeLinecap={stroke ? "round" : undefined} strokeLinejoin={stroke ? "round" : undefined} />
  </svg>
);
const icons = {
  mail: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  users: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75M9 7a4 4 0 100 8 4 4 0 000-8z",
  chart: "M18 20V10M12 20V4M6 20v-6",
  send: "M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z",
  template: "M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z",
  settings: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
  upload: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12",
  plus: "M12 5v14M5 12h14",
  trash: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16",
  eye: "M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z",
  check: "M5 13l4 4L19 7",
  segment: "M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z",
  x: "M6 18L18 6M6 6l12 12",
  edit: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
  wifi: "M5 12.55a11 11 0 0114.08 0M1.42 9a16 16 0 0121.16 0M8.53 16.11a6 6 0 016.95 0M12 20h.01",
};

// ── templates HTML ───────────────────────────────────────────────────────────
const emailTemplates = [
  {
    id: 1, name: "Bienvenida", category: "Onboarding",
    preview: "Hola {{nombre}}, bienvenido a nuestra plataforma...",
    html: `<div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;background:#fafaf8;border:1px solid #e5e5e0"><div style="background:#1a1a1a;padding:32px;text-align:center"><h1 style="color:#f5f0e8;font-size:28px;margin:0;letter-spacing:2px">BIENVENIDO</h1></div><div style="padding:40px"><p style="font-size:18px;color:#2a2a2a">Hola <strong>{{contact.FIRSTNAME}}</strong>,</p><p style="color:#555;line-height:1.8">Gracias por unirte a nuestra comunidad. Estamos emocionados de tenerte con nosotros.</p><div style="text-align:center;margin:32px 0"><a href="{{params.url}}" style="background:#1a1a1a;color:#f5f0e8;padding:14px 32px;text-decoration:none;font-size:14px;letter-spacing:1px">COMENZAR AHORA</a></div></div><div style="background:#f0ede6;padding:20px;text-align:center;font-size:12px;color:#888">© 2025 Tu Empresa. <a href="{{unsubscribe}}" style="color:#888">Darse de baja</a></div></div>`
  },
  {
    id: 2, name: "Promoción", category: "Marketing",
    preview: "¡Oferta exclusiva por tiempo limitado!",
    html: `<div style="font-family:'Trebuchet MS',sans-serif;max-width:600px;margin:0 auto;background:#fff"><div style="background:linear-gradient(135deg,#e63946,#c1121f);padding:48px;text-align:center"><p style="color:rgba(255,255,255,0.8);font-size:13px;letter-spacing:3px;margin:0 0 8px">OFERTA ESPECIAL</p><h1 style="color:#fff;font-size:56px;margin:0;font-weight:900">-30%</h1><p style="color:rgba(255,255,255,0.9);font-size:16px">Solo por tiempo limitado</p></div><div style="padding:40px;text-align:center"><p style="font-size:16px;color:#333;line-height:1.8">Hola <strong>{{contact.FIRSTNAME}}</strong>, tenemos una oferta exclusiva para ti.</p><a href="{{params.offerUrl}}" style="display:inline-block;background:#e63946;color:#fff;padding:16px 40px;text-decoration:none;font-weight:bold;font-size:16px;border-radius:4px;margin-top:20px">APROVECHAR OFERTA</a><p style="font-size:12px;color:#aaa;margin-top:24px">Válido hasta el {{params.fechaFin}}</p></div><div style="padding:20px;text-align:center;font-size:12px;color:#aaa"><a href="{{unsubscribe}}" style="color:#aaa">Darse de baja</a></div></div>`
  },
  {
    id: 3, name: "Newsletter", category: "Newsletter",
    preview: "Las últimas noticias y actualizaciones...",
    html: `<div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;background:#fff"><div style="border-bottom:3px solid #2d4a3e;padding:24px;display:flex;justify-content:space-between;align-items:center"><span style="font-size:22px;font-weight:bold;color:#2d4a3e">TU NEWSLETTER</span></div><div style="padding:32px"><h2 style="color:#2d4a3e;font-size:24px">Hola {{contact.FIRSTNAME}},</h2><h3 style="color:#2d4a3e">Lo más destacado esta semana</h3><div style="border-left:4px solid #a8c5bb;padding-left:16px;margin:24px 0"><p style="color:#555;line-height:1.8">{{params.contenido}}</p><a href="{{params.url}}" style="color:#2d4a3e;font-size:13px;font-weight:bold">Leer más →</a></div></div><div style="background:#f0ede6;padding:20px;text-align:center;font-size:12px;color:#888"><a href="{{unsubscribe}}" style="color:#888">Darse de baja</a></div></div>`
  },
  {
    id: 4, name: "Reactivación", category: "Retención",
    preview: "Te echamos de menos, vuelve con nosotros...",
    html: `<div style="font-family:'Helvetica Neue',sans-serif;max-width:600px;margin:0 auto;background:#f8f4ff"><div style="padding:48px;text-align:center"><div style="font-size:60px">💌</div><h1 style="color:#4a1d96;font-size:28px">Te echamos de menos</h1><p style="color:#6b21a8;font-size:16px;line-height:1.8">Hola <strong>{{contact.FIRSTNAME}}</strong>, hace tiempo que no sabemos de ti.</p><a href="{{params.url}}" style="display:inline-block;background:#7c3aed;color:#fff;padding:14px 36px;text-decoration:none;border-radius:50px;font-size:15px;margin-top:24px">Volver a conectar</a></div><div style="padding:20px;text-align:center;font-size:12px;color:#aaa"><a href="{{unsubscribe}}" style="color:#aaa">Darse de baja</a></div></div>`
  },
];

// ── datos locales demo ───────────────────────────────────────────────────────
const initialCampaigns = [
  { id: 1, name: "Lanzamiento Producto Q1", subject: "¡Nuevo producto disponible!", status: "sent", sent: 1240, opens: 389, clicks: 142, date: "2025-01-15", list: "Clientes VIP", brevoId: null },
  { id: 2, name: "Newsletter Febrero", subject: "Novedades de Febrero 🚀", status: "sent", sent: 3200, opens: 960, clicks: 287, date: "2025-02-01", list: "Newsletter", brevoId: null },
];

// ── UI helpers ───────────────────────────────────────────────────────────────
const statusBadge = (s) => {
  const cfg = {
    sent: { bg: "#dcfce7", color: "#166534", label: "Enviada" },
    draft: { bg: "#f1f5f9", color: "#475569", label: "Borrador" },
    scheduled: { bg: "#fef9c3", color: "#854d0e", label: "Programada" },
    sending: { bg: "#dbeafe", color: "#1e40af", label: "Enviando..." },
    error: { bg: "#fee2e2", color: "#991b1b", label: "Error" },
  };
  const c = cfg[s] || cfg.draft;
  return <span style={{ background: c.bg, color: c.color, padding: "2px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{c.label}</span>;
};

const Modal = ({ title, onClose, children, wide }) => (
  <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
    <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: wide ? 800 : 560, maxHeight: "90vh", overflow: "auto", boxShadow: "0 25px 60px rgba(0,0,0,0.2)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: "1px solid #e8e4dc" }}>
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, fontFamily: "Georgia, serif" }}>{title}</h3>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#888", padding: 4 }}>
          <Icon d={icons.x} size={20} stroke />
        </button>
      </div>
      <div style={{ padding: 24 }}>{children}</div>
    </div>
  </div>
);

const Input = ({ label, ...p }) => (
  <div style={{ marginBottom: 16 }}>
    {label && <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#444", marginBottom: 6 }}>{label}</label>}
    <input style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #e8e4dc", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} {...p} />
  </div>
);

const Btn = ({ children, variant = "primary", onClick, small, icon, disabled }) => {
  const styles = {
    primary: { background: disabled ? "#ccc" : "#1a1a1a", color: "#f5f0e8", border: "none" },
    secondary: { background: "#fff", color: "#1a1a1a", border: "1.5px solid #1a1a1a" },
    danger: { background: "#fee2e2", color: "#991b1b", border: "none" },
    ghost: { background: "transparent", color: "#555", border: "1.5px solid #e8e4dc" },
    success: { background: "#dcfce7", color: "#166534", border: "none" },
  };
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ ...styles[variant], padding: small ? "7px 14px" : "10px 20px", borderRadius: 8, cursor: disabled ? "not-allowed" : "pointer", fontSize: small ? 12 : 14, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "inherit", opacity: disabled ? 0.7 : 1 }}>
      {icon && <Icon d={icons[icon]} size={small ? 14 : 16} stroke />}{children}
    </button>
  );
};

// ════════════════════════════════════════════════════════════════════════════
// SETTINGS (con test real de conexión)
// ════════════════════════════════════════════════════════════════════════════
function Settings({ config, setConfig }) {
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const save = () => {
    localStorage.setItem("mailstudio_config", JSON.stringify(config));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  // Llama al backend real para verificar la API Key
  const testConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/test-brevo");
      const data = await res.json();
      if (data.success) {
        setTestResult({ ok: true, account: data.account });
      } else {
        setTestResult({ ok: false, error: data.error });
      }
    } catch (e) {
      setTestResult({ ok: false, error: "No se pudo conectar con el servidor" });
    }
    setTesting(false);
  };

  const field = (label, key, type = "text", ph = "") => (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#444", marginBottom: 6 }}>{label}</label>
      <input type={type} value={config[key] || ""} onChange={e => setConfig(p => ({ ...p, [key]: e.target.value }))} placeholder={ph}
        style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #e8e4dc", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontFamily: "Georgia, serif", fontSize: 28, margin: "0 0 4px" }}>Configuración</h2>
        <p style={{ color: "#888", margin: 0 }}>Conecta tu cuenta de Brevo para envíos reales</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* API */}
        <div style={{ background: "#fff", border: "1px solid #e8e4dc", borderRadius: 12, padding: 28 }}>
          <h3 style={{ fontFamily: "Georgia, serif", fontSize: 17, margin: "0 0 20px" }}>🔑 API de Brevo</h3>
          <div style={{ background: "#fffbeb", border: "1px solid #fef08a", borderRadius: 8, padding: 12, marginBottom: 16 }}>
            <p style={{ margin: 0, fontSize: 12, color: "#854d0e" }}>
              ⚠️ La API Key va en <strong>.env.local</strong> (BREVO_API_KEY=xxx), no aquí. Este campo es solo referencia visual.
            </p>
          </div>
          {field("API Key (solo referencia visual)", "apiKey", "password", "xkeysib-...")}
          <button onClick={testConnection} disabled={testing}
            style={{ width: "100%", padding: "10px", background: "#f8f6f2", border: "1.5px solid #e8e4dc", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "inherit", color: "#555" }}>
            {testing ? "⏳ Probando conexión..." : "🔌 Probar conexión con Brevo"}
          </button>
          {testResult && (
            <div style={{ marginTop: 12, padding: "12px 14px", borderRadius: 8, background: testResult.ok ? "#dcfce7" : "#fee2e2", color: testResult.ok ? "#166534" : "#991b1b", fontSize: 13 }}>
              {testResult.ok
                ? <><strong>✅ Conexión exitosa</strong><br />Cuenta: {testResult.account?.email}<br />Plan: {testResult.account?.plan}</>
                : <><strong>❌ Error:</strong> {testResult.error}</>
              }
            </div>
          )}
        </div>

        {/* REMITENTE */}
        <div style={{ background: "#fff", border: "1px solid #e8e4dc", borderRadius: 12, padding: 28 }}>
          <h3 style={{ fontFamily: "Georgia, serif", fontSize: 17, margin: "0 0 20px" }}>✉️ Datos del remitente</h3>
          {field("Nombre del remitente", "senderName", "text", "Mi Empresa")}
          {field("Email del remitente", "senderEmail", "email", "hola@miempresa.com")}
          {field("Email de respuesta (Reply-To)", "replyTo", "email", "respuestas@miempresa.com")}
          <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 8, padding: 12 }}>
            <p style={{ margin: 0, fontSize: 12, color: "#0369a1" }}>
              💡 El email del remitente debe estar <strong>verificado en Brevo</strong>. Ve a Senders & IP → Senders.
            </p>
          </div>
        </div>

        {/* GUÍA */}
        <div style={{ background: "#fafaf8", border: "1px solid #e8e4dc", borderRadius: 12, padding: 28, gridColumn: "1 / -1" }}>
          <h3 style={{ fontFamily: "Georgia, serif", fontSize: 17, margin: "0 0 16px" }}>🚀 Configuración del archivo .env.local</h3>
          <p style={{ fontSize: 14, color: "#555", marginBottom: 12 }}>Crea o edita el archivo <code style={{ background: "#f0ede6", padding: "2px 6px", borderRadius: 4 }}>.env.local</code> en la raíz de tu proyecto con esto:</p>
          <pre style={{ background: "#1a1a1a", color: "#a8ff78", padding: 20, borderRadius: 10, fontSize: 14, overflowX: "auto", margin: "0 0 16px" }}>
{`# Brevo API Key (obtenla en app.brevo.com → SMTP & API → API Keys)
BREVO_API_KEY=xkeysib-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Reinicia el servidor después de guardar: npm run dev`}
          </pre>
          <p style={{ fontSize: 13, color: "#888", margin: 0 }}>
            ⚠️ Después de editar <code>.env.local</code> debes <strong>reiniciar el servidor</strong> con Ctrl+C y luego <code>npm run dev</code> de nuevo.
          </p>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 24 }}>
        <Btn icon={saved ? "check" : "settings"} onClick={save}>
          {saved ? "¡Guardado!" : "Guardar configuración"}
        </Btn>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// CAMPAIGNS (con envío real a Brevo)
// ════════════════════════════════════════════════════════════════════════════
function Campaigns({ campaigns, setCampaigns, config }) {
  const [showNew, setShowNew] = useState(false);
  const [showPreview, setShowPreview] = useState(null);
  const [toast, setToast] = useState(null);
  const [brevoLists, setBrevoLists] = useState([]);
  const [loadingLists, setLoadingLists] = useState(false);

  const [newCampaign, setNewCampaign] = useState({
    name: "", subject: "", preheader: "", listId: "", templateId: "1",
  });

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 4000);
  };

  // Carga listas reales de Brevo al abrir el modal
  const openNew = async () => {
    setShowNew(true);
    setLoadingLists(true);
    try {
      const res = await fetch("/api/brevo-lists");
      const data = await res.json();
      if (data.success) setBrevoLists(data.lists);
    } catch { }
    setLoadingLists(false);
  };

  // Envío real via backend
  const handleSend = async (camp) => {
    if (!config.senderEmail || !config.senderName) {
      showToast("Configura el nombre y email del remitente en Configuración", false);
      return;
    }

    const template = emailTemplates.find(t => String(t.id) === String(camp.templateId)) || emailTemplates[0];

    setCampaigns(p => p.map(c => c.id === camp.id ? { ...c, status: "sending" } : c));

    try {
      const res = await fetch("/api/send-campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignName: camp.name,
          subject: camp.subject,
          preheader: camp.preheader || "",
          senderName: config.senderName,
          senderEmail: config.senderEmail,
          listId: camp.listId,
          templateHtml: template.html,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setCampaigns(p => p.map(c => c.id === camp.id
          ? { ...c, status: "sent", brevoId: data.campaignId, date: new Date().toISOString().split("T")[0] }
          : c
        ));
        showToast(`✅ "${camp.name}" enviada correctamente a través de Brevo (ID: ${data.campaignId})`);
      } else {
        setCampaigns(p => p.map(c => c.id === camp.id ? { ...c, status: "error" } : c));
        showToast(`❌ Error: ${data.error}`, false);
      }
    } catch (e) {
      setCampaigns(p => p.map(c => c.id === camp.id ? { ...c, status: "error" } : c));
      showToast("❌ Error de conexión con el servidor", false);
    }
  };

  const handleCreate = () => {
    if (!newCampaign.name || !newCampaign.subject) return;
    setCampaigns(p => [...p, {
      ...newCampaign,
      id: Date.now(),
      status: "draft",
      sent: 0, opens: 0, clicks: 0,
      date: new Date().toISOString().split("T")[0],
      brevoId: null,
    }]);
    setShowNew(false);
    setNewCampaign({ name: "", subject: "", preheader: "", listId: "", templateId: "1" });
  };

  return (
    <div>
      {/* TOAST */}
      {toast && (
        <div style={{ position: "fixed", top: 24, right: 24, zIndex: 2000, background: toast.ok ? "#1a1a1a" : "#991b1b", color: "#fff", padding: "14px 20px", borderRadius: 10, fontSize: 14, fontWeight: 600, maxWidth: 420, boxShadow: "0 8px 30px rgba(0,0,0,0.3)" }}>
          {toast.msg}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: 28, margin: "0 0 4px" }}>Campañas</h2>
          <p style={{ color: "#888", margin: 0 }}>Envíos reales conectados a tu cuenta Brevo</p>
        </div>
        <Btn icon="plus" onClick={openNew}>Nueva campaña</Btn>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {campaigns.map(c => {
          const template = emailTemplates.find(t => String(t.id) === String(c.templateId)) || emailTemplates[0];
          return (
            <div key={c.id} style={{ background: "#fff", border: "1px solid #e8e4dc", borderRadius: 12, padding: 24, display: "flex", alignItems: "center", gap: 20 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon d={icons.send} size={20} stroke color="#64748b" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <h3 style={{ fontFamily: "Georgia, serif", fontSize: 17, margin: 0 }}>{c.name}</h3>
                  {statusBadge(c.status)}
                  {c.brevoId && <span style={{ fontSize: 11, color: "#aaa", fontFamily: "monospace" }}>Brevo #{c.brevoId}</span>}
                </div>
                <p style={{ margin: "0 0 4px", fontSize: 13, color: "#555" }}>Asunto: {c.subject}</p>
                <p style={{ margin: 0, fontSize: 12, color: "#aaa" }}>
                  Lista Brevo ID: {c.listId || "—"} · Plantilla: {template?.name} · {c.date}
                </p>
              </div>
              {c.status === "sent" && (
                <div style={{ display: "flex", gap: 24, textAlign: "center" }}>
                  {[["Enviados", c.sent || "—"], ["Aperturas", c.sent ? `${((c.opens / c.sent) * 100).toFixed(0)}%` : "—"], ["Clics", c.sent ? `${((c.clicks / c.sent) * 100).toFixed(0)}%` : "—"]].map(([l, v]) => (
                    <div key={l}>
                      <p style={{ margin: 0, fontSize: 18, fontWeight: 800, fontFamily: "Georgia, serif" }}>{v}</p>
                      <p style={{ margin: 0, fontSize: 11, color: "#aaa", fontFamily: "monospace" }}>{l.toUpperCase()}</p>
                    </div>
                  ))}
                </div>
              )}
              {(c.status === "draft" || c.status === "error") && (
                <div style={{ display: "flex", gap: 8 }}>
                  <Btn variant="ghost" small icon="eye" onClick={() => setShowPreview(template)}>Preview</Btn>
                  <Btn small icon="send" onClick={() => handleSend(c)}>
                    {c.status === "error" ? "Reintentar" : "Enviar vía Brevo"}
                  </Btn>
                </div>
              )}
              {c.status === "sending" && (
                <div style={{ fontSize: 13, color: "#1e40af", fontWeight: 600 }}>⏳ Enviando...</div>
              )}
            </div>
          );
        })}
      </div>

      {/* MODAL NUEVA CAMPAÑA */}
      {showNew && (
        <Modal title="Nueva campaña" onClose={() => setShowNew(false)} wide>
          <Input label="Nombre de la campaña (interno)" value={newCampaign.name}
            onChange={e => setNewCampaign(p => ({ ...p, name: e.target.value }))} placeholder="Ej: Newsletter Mayo 2025" />
          <Input label="Asunto del email" value={newCampaign.subject}
            onChange={e => setNewCampaign(p => ({ ...p, subject: e.target.value }))} placeholder="Ej: ¡Novedad exclusiva para ti! 🎁" />
          <Input label="Texto de previsualización (preheader)" value={newCampaign.preheader}
            onChange={e => setNewCampaign(p => ({ ...p, preheader: e.target.value }))} placeholder="Texto que se ve antes de abrir el email..." />

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#444", marginBottom: 6 }}>
              ID de lista en Brevo
              {loadingLists && <span style={{ color: "#aaa", fontWeight: 400, marginLeft: 8 }}>Cargando listas...</span>}
            </label>
            {brevoLists.length > 0 ? (
              <select value={newCampaign.listId} onChange={e => setNewCampaign(p => ({ ...p, listId: e.target.value }))}
                style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #e8e4dc", borderRadius: 8, fontSize: 14, outline: "none", fontFamily: "inherit", background: "#fff" }}>
                <option value="">Selecciona una lista...</option>
                {brevoLists.map(l => <option key={l.id} value={l.id}>{l.name} ({l.uniqueSubscribers} suscriptores) — ID: {l.id}</option>)}
              </select>
            ) : (
              <input value={newCampaign.listId} onChange={e => setNewCampaign(p => ({ ...p, listId: e.target.value }))} placeholder="Ej: 2  (ve a Brevo → Contacts → Lists → el número)"
                style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #e8e4dc", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
            )}
            <p style={{ fontSize: 12, color: "#aaa", margin: "6px 0 0" }}>En Brevo: Contacts → Lists → el número que aparece junto al nombre de la lista</p>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#444", marginBottom: 6 }}>Plantilla de diseño</label>
            <select value={newCampaign.templateId} onChange={e => setNewCampaign(p => ({ ...p, templateId: e.target.value }))}
              style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #e8e4dc", borderRadius: 8, fontSize: 14, outline: "none", fontFamily: "inherit", background: "#fff" }}>
              {emailTemplates.map(t => <option key={t.id} value={t.id}>{t.name} — {t.category}</option>)}
            </select>
          </div>

          <div style={{ background: "#fffbeb", border: "1px solid #fef08a", borderRadius: 8, padding: 12, marginBottom: 16 }}>
            <p style={{ margin: 0, fontSize: 13, color: "#854d0e" }}>
              ⚠️ Asegúrate de que el email remitente <strong>{config.senderEmail || "(no configurado)"}</strong> esté verificado en Brevo antes de enviar.
            </p>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <Btn variant="ghost" onClick={() => setShowNew(false)}>Cancelar</Btn>
            <Btn icon="plus" onClick={handleCreate} disabled={!newCampaign.name || !newCampaign.subject}>Crear campaña</Btn>
          </div>
        </Modal>
      )}

      {/* MODAL PREVIEW */}
      {showPreview && (
        <Modal title={`Vista previa: ${showPreview.name}`} onClose={() => setShowPreview(null)} wide>
          <div style={{ border: "1px solid #e8e4dc", borderRadius: 8, overflow: "hidden" }}>
            <div dangerouslySetInnerHTML={{ __html: showPreview.html }} />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
            <Btn variant="ghost" onClick={() => setShowPreview(null)}>Cerrar</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// DASHBOARD
// ════════════════════════════════════════════════════════════════════════════
function Dashboard({ campaigns, config }) {
  const sent = campaigns.filter(c => c.status === "sent");
  const connected = !!config.senderEmail;

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontFamily: "Georgia, serif", fontSize: 28, margin: "0 0 4px" }}>Panel de control</h2>
        <p style={{ color: "#888", margin: 0 }}>Resumen de tu actividad de email marketing</p>
      </div>

      {!connected && (
        <div style={{ background: "#fffbeb", border: "1px solid #fef08a", borderRadius: 10, padding: "14px 20px", marginBottom: 24, display: "flex", alignItems: "center", gap: 12 }}>
          <Icon d={icons.settings} size={20} stroke color="#854d0e" />
          <p style={{ margin: 0, color: "#854d0e", fontSize: 14 }}>
            <strong>Configura tu cuenta</strong> — Ve a Configuración, agrega tu email remitente y prueba la conexión con Brevo para empezar a enviar.
          </p>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16, marginBottom: 32 }}>
        {[
          ["CAMPAÑAS ENVIADAS", sent.length, "campañas reales"],
          ["ESTADO BREVO", config.senderEmail ? "Listo" : "Pendiente", config.senderEmail ? `Remitente: ${config.senderEmail}` : "Ve a Configuración"],
          ["API KEY", process ? "Configurada" : "Pendiente", "en .env.local"],
          ["PLANTILLAS", emailTemplates.length, "diseños disponibles"],
        ].map(([l, v, s]) => (
          <div key={l} style={{ background: "#fff", border: "1px solid #e8e4dc", borderRadius: 12, padding: "20px 24px" }}>
            <p style={{ margin: 0, fontSize: 11, color: "#888", fontFamily: "monospace", letterSpacing: 1 }}>{l}</p>
            <p style={{ margin: "8px 0 4px", fontSize: 28, fontWeight: 800, color: "#1a1a1a", fontFamily: "Georgia, serif" }}>{v}</p>
            <p style={{ margin: 0, fontSize: 12, color: "#aaa" }}>{s}</p>
          </div>
        ))}
      </div>

      <div style={{ background: "#fff", border: "1px solid #e8e4dc", borderRadius: 12, padding: 24 }}>
        <h3 style={{ fontFamily: "Georgia, serif", fontSize: 18, margin: "0 0 20px" }}>Campañas</h3>
        {campaigns.length === 0
          ? <p style={{ color: "#aaa", textAlign: "center", padding: 32 }}>Aún no has creado ninguna campaña. Ve a la sección Campañas para empezar.</p>
          : campaigns.map(c => (
            <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #f8f6f2" }}>
              <div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#1a1a1a" }}>{c.name}</p>
                <p style={{ margin: 0, fontSize: 12, color: "#aaa" }}>{c.date}</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {c.brevoId && <span style={{ fontSize: 11, color: "#aaa", fontFamily: "monospace" }}>ID Brevo: {c.brevoId}</span>}
                {statusBadge(c.status)}
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// TEMPLATES
// ════════════════════════════════════════════════════════════════════════════
function Templates() {
  const [preview, setPreview] = useState(null);
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: "Georgia, serif", fontSize: 28, margin: "0 0 4px" }}>Plantillas</h2>
        <p style={{ color: "#888", margin: 0 }}>Diseños HTML compatibles con Brevo y variables de personalización</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 20 }}>
        {emailTemplates.map(t => (
          <div key={t.id} style={{ background: "#fff", border: "1px solid #e8e4dc", borderRadius: 12, overflow: "hidden" }}>
            <div style={{ height: 160, background: "#f8f6f2", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative" }}>
              <div style={{ transform: "scale(0.3)", transformOrigin: "center", width: 600, position: "absolute" }} dangerouslySetInnerHTML={{ __html: t.html }} />
            </div>
            <div style={{ padding: 20 }}>
              <h3 style={{ fontFamily: "Georgia, serif", fontSize: 17, margin: "0 0 4px" }}>{t.name}</h3>
              <span style={{ fontSize: 11, color: "#888", background: "#f0ede6", padding: "2px 8px", borderRadius: 10 }}>{t.category}</span>
              <p style={{ fontSize: 13, color: "#888", margin: "10px 0 16px" }}>{t.preview}</p>
              <div style={{ background: "#f8f6f2", borderRadius: 8, padding: 10, marginBottom: 12 }}>
                <p style={{ margin: 0, fontSize: 11, color: "#888", fontFamily: "monospace" }}>VARIABLES BREVO</p>
                <p style={{ margin: "4px 0 0", fontSize: 12, color: "#555", fontFamily: "monospace" }}>{"{{contact.FIRSTNAME}}"} {"{{unsubscribe}}"}</p>
              </div>
              <Btn variant="ghost" small icon="eye" onClick={() => setPreview(t)}>Vista previa</Btn>
            </div>
          </div>
        ))}
      </div>
      {preview && (
        <Modal title={`Vista previa: ${preview.name}`} onClose={() => setPreview(null)} wide>
          <div style={{ border: "1px solid #e8e4dc", borderRadius: 8, overflow: "hidden" }}>
            <div dangerouslySetInnerHTML={{ __html: preview.html }} />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
            <Btn variant="ghost" onClick={() => setPreview(null)}>Cerrar</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// MAIN APP
// ════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [page, setPage] = useState("dashboard");
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [config, setConfig] = useState({ senderName: "", senderEmail: "", replyTo: "", apiKey: "" });

  // Carga config guardada solo en el cliente (evita error de hidratación Next.js)
  useEffect(() => {
    try {
      const saved = localStorage.getItem("mailstudio_config");
      if (saved) setConfig(JSON.parse(saved));
    } catch {}
  }, []);

  const nav = [
    { id: "dashboard", label: "Panel", icon: "chart" },
    { id: "campaigns", label: "Campañas", icon: "send" },
    { id: "templates", label: "Plantillas", icon: "template" },
    { id: "settings", label: "Configuración", icon: "settings" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f8f5ef", display: "flex", fontFamily: "'Palatino Linotype', Georgia, serif" }}>
      <aside style={{ width: 220, background: "#1a1a1a", display: "flex", flexDirection: "column", position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 100 }}>
        <div style={{ padding: "28px 24px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <div style={{ width: 28, height: 28, background: "#f5f0e8", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon d={icons.mail} size={16} stroke color="#1a1a1a" />
            </div>
            <span style={{ color: "#f5f0e8", fontSize: 16, fontWeight: 800, letterSpacing: 1 }}>MailStudio</span>
          </div>
          <p style={{ color: "#555", fontSize: 11, margin: 0, letterSpacing: 2, fontFamily: "monospace" }}>EMAIL MARKETING</p>
        </div>
        <nav style={{ flex: 1, padding: "8px 12px" }}>
          {nav.map(n => (
            <button key={n.id} onClick={() => setPage(n.id)}
              style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 12px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 14, fontWeight: page === n.id ? 700 : 400, fontFamily: "inherit", textAlign: "left", marginBottom: 2, background: page === n.id ? "rgba(245,240,232,0.12)" : "transparent", color: page === n.id ? "#f5f0e8" : "#888" }}>
              <Icon d={icons[n.icon]} size={16} stroke color={page === n.id ? "#f5f0e8" : "#666"} />
              {n.label}
            </button>
          ))}
        </nav>
        <div style={{ padding: "16px 24px", borderTop: "1px solid #2a2a2a" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: config.senderEmail ? "#4ade80" : "#f87171" }} />
            <p style={{ color: "#666", fontSize: 12, margin: 0 }}>{config.senderEmail ? "Brevo conectado" : "Sin configurar"}</p>
          </div>
        </div>
      </aside>

      <main style={{ marginLeft: 220, flex: 1, padding: 40, minHeight: "100vh" }}>
        {page === "dashboard" && <Dashboard campaigns={campaigns} config={config} />}
        {page === "campaigns" && <Campaigns campaigns={campaigns} setCampaigns={setCampaigns} config={config} />}
        {page === "templates" && <Templates />}
        {page === "settings" && <Settings config={config} setConfig={setConfig} />}
      </main>
    </div>
  );
}
