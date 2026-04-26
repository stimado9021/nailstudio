"use client";
// app/components/Campaigns.tsx
// Recibe brevoLists desde page.tsx (listas creadas en Contacts)

import { useState, useEffect } from "react";
import { Campaign, Config, BrevoList, EmailTemplate } from "./types";
import { emailTemplates } from "./emailTemplates";
import { Btn, Field, Modal, Icon, icons, inputStyle, statusBadge } from "./ui";

export default function Campaigns({
  config,
  toast,
  campaigns,
  setCampaigns,
  brevoLists,
}: {
  config: Config;
  toast: (msg: string, ok?: boolean) => void;
  campaigns: Campaign[];
  setCampaigns: React.Dispatch<React.SetStateAction<Campaign[]>>;
  brevoLists: BrevoList[];
}) {
  const [showNew, setShowNew]           = useState(false);
  const [showPrev, setShowPrev]         = useState<EmailTemplate | null>(null);
  const [loadingLists, setLoadingLists] = useState(false);
  const [remoteLists, setRemoteLists]   = useState<BrevoList[]>([]);
  const [form, setForm] = useState({ 
    name: "", 
    subject: "", 
    preheader: "", 
    listId: "", 
    templateId: "1",
    customHtml: "" // Nuevo campo para HTML manual
  });

  // Combina las listas locales (creadas en esta sesión) con las remotas de Brevo
  const allLists = [
    ...brevoLists,
    ...remoteLists.filter(r => !brevoLists.find(b => b.id === r.id)),
  ];

  // Cargar listas de Brevo al montar el componente
  useEffect(() => {
    loadBrevoLists();
  }, []);

  const loadBrevoLists = async () => {
    setLoadingLists(true);
    try {
      const res  = await fetch("/api/brevo-lists");
      const data = await res.json();
      if (data.success && data.lists?.length) setRemoteLists(data.lists);
    } catch {}
    setLoadingLists(false);
  };

  // Carga listas SIEMPRE al abrir modal
  const openNew = async () => {
    setShowNew(true);
    setLoadingLists(true);
    try {
      const res  = await fetch("/api/brevo-lists");
      const data = await res.json();
      if (data.success && data.lists?.length) setRemoteLists(data.lists);
    } catch {}
    setLoadingLists(false);
  };

  const handleCreate = () => {
    if (!form.name || !form.subject) return;
    const listName = allLists.find(l => String(l.id) === form.listId)?.name ?? `Lista #${form.listId}`;
    setCampaigns(p => [...p, {
      ...form,
      id: Date.now(),
      status: "draft",
      sent: 0, opens: 0, clicks: 0,
      date: new Date().toISOString().split("T")[0],
      brevoId: null,
      listName,
    }]);
    setShowNew(false);
    setForm({ name: "", subject: "", preheader: "", listId: "", templateId: "1", customHtml: "" });
  };

  const handleSend = async (camp: Campaign) => {
    if (!config.senderEmail || !config.senderName) {
      toast("⚠️ Configura el remitente en Configuración antes de enviar", false); return;
    }
    if (!camp.listId) {
      toast("⚠️ Esta campaña no tiene lista de Brevo asignada", false); return;
    }

    // Si es personalizado usamos el HTML guardado, si no, lo buscamos en las plantillas
    let htmlToSend = "";
    if (camp.templateId === "custom") {
      htmlToSend = camp.customHtml;
    } else {
      const tmpl = emailTemplates.find(t => String(t.id) === String(camp.templateId)) ?? emailTemplates[0];
      htmlToSend = tmpl.html;
    }

    if (!htmlToSend) {
      toast("⚠️ El contenido del correo está vacío", false); return;
    }

    setCampaigns(p => p.map(c => c.id === camp.id ? { ...c, status: "sending" } : c));

    try {
      const res = await fetch("/api/send-campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignName: camp.name,
          subject:      camp.subject,
          preheader:    camp.preheader ?? "",
          senderName:   config.senderName,
          senderEmail:  config.senderEmail,
          listId:       camp.listId,
          templateHtml: htmlToSend,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setCampaigns(p => p.map(c => c.id === camp.id
          ? { ...c, status: "sent", brevoId: data.campaignId, date: new Date().toISOString().split("T")[0] }
          : c
        ));
        toast(`✅ Campaña "${camp.name}" enviada correctamente (ID Brevo: ${data.campaignId})`);
      } else {
        setCampaigns(p => p.map(c => c.id === camp.id ? { ...c, status: "error" } : c));
        toast(`❌ Error Brevo: ${data.error}`, false);
      }
    } catch {
      setCampaigns(p => p.map(c => c.id === camp.id ? { ...c, status: "error" } : c));
      toast("❌ Error de red. Verifica tu conexión.", false);
    }
  };

  const currentTemplate = emailTemplates.find(t => String(t.id) === form.templateId) ?? emailTemplates[0];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: 28, margin: "0 0 4px" }}>Campañas</h2>
          <p style={{ color: "#888", margin: 0 }}>Envíos reales a través de la API de Brevo</p>
        </div>
        <Btn icon="plus" onClick={openNew}>Nueva campaña</Btn>
      </div>

      {/* Estado de listas */}
      {loadingLists ? (
        <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 10, padding: "14px 20px", marginBottom: 24 }}>
          <p style={{ margin: 0, color: "#0369a1", fontSize: 14 }}>⏳ Cargando listas desde Brevo...</p>
        </div>
      ) : allLists.length > 0 ? (
        <div style={{ background: "#dcfce7", border: "1px solid #bbf7d0", borderRadius: 10, padding: "14px 20px", marginBottom: 24 }}>
          <p style={{ margin: 0, color: "#166534", fontSize: 14, fontWeight: 600 }}>
            ✅ {allLists.length} lista{allLists.length > 1 ? "s" : ""} disponible{allLists.length > 1 ? "s" : ""} en Brevo:
            {" "}{allLists.map(l => `${l.name} (ID: ${l.id})`).join(" · ")}
          </p>
        </div>
      ) : (
        <div style={{ background: "#fffbeb", border: "1px solid #fef08a", borderRadius: 10, padding: "14px 20px", marginBottom: 24 }}>
          <p style={{ margin: 0, color: "#854d0e", fontSize: 14 }}>
            📋 <strong>Paso previo:</strong> Ve a <strong>Contactos → Subir a Brevo</strong> para crear una lista. Una vez subidos, las listas aparecen aquí automáticamente.
          </p>
        </div>
      )}

      {/* Flujo de 3 pasos */}
      <div style={{ display: "flex", marginBottom: 28, background: "#fff", border: "1px solid #e8e4dc", borderRadius: 12, overflow: "hidden" }}>
        {[
          { n: "1", label: "Sube contactos a Brevo",  sub: "Contactos → Subir a Brevo", done: brevoLists.length > 0 },
          { n: "2", label: "Crea la campaña",          sub: "Elige lista, asunto y plantilla", done: campaigns.length > 0 },
          { n: "3", label: "Envía vía Brevo",          sub: "Los emails llegan a tus contactos", done: campaigns.some(c => c.status === "sent") },
        ].map((s, i) => (
          <div key={i} style={{ flex: 1, padding: "16px 20px", borderRight: i < 2 ? "1px solid #e8e4dc" : "none", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: s.done ? "#dcfce7" : "#f8f6f2", border: `2px solid ${s.done ? "#166534" : "#e8e4dc"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: s.done ? "#166534" : "#aaa" }}>{s.n}</span>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#1a1a1a" }}>{s.label}</p>
              <p style={{ margin: 0, fontSize: 11, color: "#aaa" }}>{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Lista de campañas */}
      {campaigns.length === 0 ? (
        <div style={{ background: "#fff", border: "2px dashed #e8e4dc", borderRadius: 12, padding: 48, textAlign: "center" }}>
          <Icon d={icons.send} size={40} stroke color="#ccc" />
          <p style={{ color: "#aaa", marginTop: 16, fontSize: 15 }}>Sin campañas aún.</p>
          <div style={{ marginTop: 16 }}><Btn icon="plus" onClick={openNew}>Crear primera campaña</Btn></div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {campaigns.map(c => {
            const tmpl = emailTemplates.find(t => String(t.id) === String(c.templateId)) ?? emailTemplates[0];
            return (
              <div key={c.id} style={{ background: "#fff", border: "1px solid #e8e4dc", borderRadius: 12, padding: 24, display: "flex", alignItems: "center", gap: 20 }}>
                <div style={{ width: 46, height: 46, borderRadius: 10, background: c.status === "sent" ? "#dcfce7" : "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon d={icons.send} size={22} stroke color={c.status === "sent" ? "#166534" : "#94a3b8"} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
                    <h3 style={{ fontFamily: "Georgia, serif", fontSize: 17, margin: 0 }}>{c.name}</h3>
                    {statusBadge(c.status)}
                    {c.brevoId && <span style={{ fontSize: 11, color: "#aaa", fontFamily: "monospace" }}>ID Brevo: #{c.brevoId}</span>}
                  </div>
                  <p style={{ margin: "0 0 3px", fontSize: 13, color: "#555" }}>Asunto: {c.subject}</p>
                  <p style={{ margin: 0, fontSize: 12, color: "#aaa" }}>Lista: {c.listName ?? `#${c.listId}`} · {tmpl.name} · {c.date}</p>
                </div>
                {(c.status === "draft" || c.status === "error") && (
                  <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                    <Btn variant="ghost" small icon="eye" onClick={() => setShowPrev(tmpl)}>Preview</Btn>
                    <Btn small icon="send" onClick={() => handleSend(c)}>{c.status === "error" ? "Reintentar" : "Enviar"}</Btn>
                  </div>
                )}
                {c.status === "sending" && <span style={{ fontSize: 13, color: "#1e40af", fontWeight: 600, flexShrink: 0 }}>⏳ Enviando...</span>}
                {c.status === "sent"    && <span style={{ fontSize: 13, color: "#166534", fontWeight: 600, flexShrink: 0 }}>✅ Enviada</span>}
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL NUEVA CAMPAÑA */}
      {showNew && (
        <Modal title="Nueva campaña" onClose={() => setShowNew(false)} wide>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
            <Field label="Nombre de campaña (interno)">
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Newsletter Mayo 2025" style={inputStyle} />
            </Field>
            <Field label="Asunto del email">
              <input value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} placeholder="¡Novedad exclusiva para ti! 🎁" style={inputStyle} />
            </Field>
          </div>

          <Field label="Preheader" note="Texto visible antes de abrir el email en el cliente de correo">
            <input value={form.preheader} onChange={e => setForm(p => ({ ...p, preheader: e.target.value }))} placeholder="Una breve descripción que acompaña al asunto..." style={inputStyle} />
          </Field>

          <Field label={`Lista de Brevo${loadingLists ? " — cargando..." : ""}`} note="Las listas que subiste en Contactos aparecen aquí automáticamente">
            {allLists.length > 0 ? (
              <select value={form.listId} onChange={e => setForm(p => ({ ...p, listId: e.target.value }))} style={inputStyle}>
                <option value="">Selecciona una lista...</option>
                {allLists.map(l => (
                  <option key={l.id} value={String(l.id)}>
                    {l.name} · {l.uniqueSubscribers} contactos · ID: {l.id}
                  </option>
                ))}
              </select>
            ) : (
              <>
                <input value={form.listId} onChange={e => setForm(p => ({ ...p, listId: e.target.value }))} placeholder="Ej: 3  (ve a Contactos → Subir a Brevo primero)" style={inputStyle} />
                <p style={{ margin: "6px 0 0", fontSize: 12, color: "#e63946", fontWeight: 600 }}>
                  ⚠️ No hay listas disponibles. Ve a Contactos → Subir a Brevo primero.
                </p>
              </>
            )}
          </Field>

          <Field label="Plantilla de diseño">
            <select value={form.templateId} onChange={e => setForm(p => ({ ...p, templateId: e.target.value }))} style={inputStyle}>
              <option value="custom">✨ HTML Personalizado (Pegar código)</option>
              {emailTemplates.map(t => <option key={t.id} value={String(t.id)}>{t.name} — {t.category}</option>)}
            </select>
          </Field>

          {form.templateId === "custom" ? (
            <Field label="Pega tu código HTML aquí" note="Usa {{nombre}} para el nombre y {{email}} para el correo.">
              <textarea 
                value={form.customHtml} 
                onChange={e => setForm(p => ({ ...p, customHtml: e.target.value }))} 
                placeholder="<html><body><h1>Hola {{nombre}}</h1>...</body></html>" 
                style={{ ...inputStyle, height: 200, fontFamily: "monospace", fontSize: 13 }}
              />
            </Field>
          ) : (
            /* Mini preview solo para plantillas predefinidas */
            <div style={{ border: "1px solid #e8e4dc", borderRadius: 10, overflow: "hidden", marginBottom: 20, height: 150, position: "relative", background: "#f8f6f2" }}>
              <div style={{ transform: "scale(0.25)", transformOrigin: "top center", width: 600, position: "absolute", top: 0, left: "50%", marginLeft: -300 }}
                dangerouslySetInnerHTML={{ __html: currentTemplate.html }} />
            </div>
          )}

          <div style={{ background: config.senderEmail ? "#f0f9ff" : "#fffbeb", border: `1px solid ${config.senderEmail ? "#bae6fd" : "#fef08a"}`, borderRadius: 8, padding: 12, marginBottom: 20 }}>
            <p style={{ margin: 0, fontSize: 13, color: config.senderEmail ? "#0369a1" : "#854d0e" }}>
              {config.senderEmail
                ? <>Remitente: <strong>{config.senderName}</strong> &lt;{config.senderEmail}&gt;</>
                : <>⚠️ Ve a <strong>Configuración</strong> y agrega el email remitente antes de enviar.</>}
            </p>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <Btn variant="ghost" onClick={() => setShowNew(false)}>Cancelar</Btn>
            <Btn icon="plus" onClick={handleCreate} disabled={!form.name || !form.subject}>Crear campaña</Btn>
          </div>
        </Modal>
      )}

      {showPrev && (
        <Modal title={`Vista previa — ${showPrev.name}`} onClose={() => setShowPrev(null)} wide>
          <div style={{ border: "1px solid #e8e4dc", borderRadius: 8, overflow: "hidden" }}>
            <div dangerouslySetInnerHTML={{ __html: showPrev.html }} />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
            <Btn variant="ghost" onClick={() => setShowPrev(null)}>Cerrar</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
