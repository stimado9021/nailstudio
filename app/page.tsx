"use client";

import { useState, useEffect, useRef, ReactNode, CSSProperties, ChangeEvent } from "react";

interface Campaign { id: number; name: string; subject: string; preheader?: string; status: string; sent: number; opens: number; clicks: number; date: string; listId?: string; listName?: string; templateId?: string; brevoId?: number | null; }
interface Config { senderName: string; senderEmail: string; replyTo: string; }
interface Template { id: number; name: string; category: string; preview: string; html: string; }
interface BrevoList { id: number; name: string; uniqueSubscribers: number; }
interface LocalContact { id: number; name: string; email: string; list: string; status: string; }

const icons: Record<string, string> = {
  mail:     "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  chart:    "M18 20V10M12 20V4M6 20v-6",
  send:     "M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z",
  template: "M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z",
  settings: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
  upload:   "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12",
  plus:     "M12 5v14M5 12h14",
  eye:      "M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z",
  check:    "M5 13l4 4L19 7",
  x:        "M6 18L18 6M6 6l12 12",
  users:    "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75M9 7a4 4 0 100 8 4 4 0 000-8z",
};

const Icon = ({ d, size = 20, color = "currentColor", stroke = false }: { d: string; size?: number; color?: string; stroke?: boolean }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={stroke ? "none" : color} stroke={stroke ? color : "none"} strokeWidth={stroke ? 2 : 0}>
    <path d={d} strokeLinecap={stroke ? "round" : undefined} strokeLinejoin={stroke ? "round" : undefined} />
  </svg>
);

const emailTemplates: Template[] = [
  { id: 1, name: "Bienvenida", category: "Onboarding", preview: "Email de bienvenida con llamada a la acción", html: `<div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;background:#fafaf8;border:1px solid #e5e5e0"><div style="background:#1a1a1a;padding:32px;text-align:center"><h1 style="color:#f5f0e8;font-size:28px;margin:0;letter-spacing:2px">BIENVENIDO</h1></div><div style="padding:40px"><p style="font-size:18px;color:#2a2a2a;margin:0 0 16px">Hola <strong>{{contact.FIRSTNAME}}</strong>,</p><p style="color:#555;line-height:1.8;margin:0 0 32px">Gracias por unirte a nuestra comunidad.</p><div style="text-align:center"><a href="https://tuempresa.com" style="background:#1a1a1a;color:#f5f0e8;padding:14px 32px;text-decoration:none;font-size:14px;letter-spacing:1px;display:inline-block">COMENZAR AHORA</a></div></div><div style="background:#f0ede6;padding:20px;text-align:center;font-size:12px;color:#888">© 2025 Tu Empresa. <a href="{{unsubscribe}}" style="color:#888">Darse de baja</a></div></div>` },
  { id: 2, name: "Promoción", category: "Marketing", preview: "Oferta especial con descuento destacado", html: `<div style="font-family:'Trebuchet MS',sans-serif;max-width:600px;margin:0 auto;background:#fff"><div style="background:linear-gradient(135deg,#e63946,#c1121f);padding:48px;text-align:center"><p style="color:rgba(255,255,255,0.8);font-size:13px;letter-spacing:3px;margin:0 0 8px">OFERTA ESPECIAL</p><h1 style="color:#fff;font-size:56px;margin:0;font-weight:900">-30%</h1><p style="color:rgba(255,255,255,0.9);font-size:16px;margin:8px 0 0">Solo por tiempo limitado</p></div><div style="padding:40px;text-align:center"><p style="font-size:16px;color:#333;margin:0 0 24px">Hola <strong>{{contact.FIRSTNAME}}</strong>, oferta exclusiva para ti.</p><a href="https://tuempresa.com/oferta" style="display:inline-block;background:#e63946;color:#fff;padding:16px 40px;text-decoration:none;font-weight:bold;font-size:16px;border-radius:4px">APROVECHAR OFERTA</a></div><div style="padding:20px;text-align:center;font-size:12px;color:#aaa"><a href="{{unsubscribe}}" style="color:#aaa">Darse de baja</a></div></div>` },
  { id: 3, name: "Newsletter", category: "Newsletter", preview: "Newsletter informativo con artículo destacado", html: `<div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;background:#fff"><div style="border-bottom:3px solid #2d4a3e;padding:24px"><span style="font-size:22px;font-weight:bold;color:#2d4a3e">TU NEWSLETTER</span></div><div style="padding:32px"><h2 style="color:#2d4a3e;font-size:22px;margin:0 0 16px">Hola {{contact.FIRSTNAME}},</h2><div style="border-left:4px solid #a8c5bb;padding-left:16px;margin:24px 0"><h3 style="color:#2d4a3e;margin:0 0 8px">Artículo destacado</h3><p style="color:#555;line-height:1.8;margin:0 0 12px">Descripción del contenido principal.</p><a href="https://tuempresa.com/blog" style="color:#2d4a3e;font-size:13px;font-weight:bold;text-decoration:none">Leer más</a></div></div><div style="background:#f0ede6;padding:20px;text-align:center;font-size:12px;color:#888"><a href="{{unsubscribe}}" style="color:#888">Darse de baja</a></div></div>` },
  { id: 4, name: "Reactivación", category: "Retención", preview: "Recupera contactos inactivos con incentivo", html: `<div style="font-family:'Helvetica Neue',sans-serif;max-width:600px;margin:0 auto;background:#f8f4ff"><div style="padding:48px;text-align:center"><div style="font-size:60px;margin-bottom:16px">💌</div><h1 style="color:#4a1d96;font-size:28px;margin:0 0 16px">Te echamos de menos</h1><p style="color:#6b21a8;font-size:16px;line-height:1.8;margin:0 0 32px">Hola <strong>{{contact.FIRSTNAME}}</strong>, tenemos novedades para ti.</p><a href="https://tuempresa.com" style="display:inline-block;background:#7c3aed;color:#fff;padding:14px 36px;text-decoration:none;border-radius:50px;font-size:15px;font-weight:bold">Volver a conectar</a></div><div style="padding:20px;text-align:center;font-size:12px;color:#aaa"><a href="{{unsubscribe}}" style="color:#aaa">Darse de baja</a></div></div>` },
];

const statusBadge = (s: string) => {
  const cfg: Record<string, { bg: string; color: string; label: string }> = {
    sent:    { bg: "#dcfce7", color: "#166534", label: "Enviada" },
    draft:   { bg: "#f1f5f9", color: "#475569", label: "Borrador" },
    sending: { bg: "#dbeafe", color: "#1e40af", label: "Enviando..." },
    error:   { bg: "#fee2e2", color: "#991b1b", label: "Error" },
  };
  const c = cfg[s] ?? cfg.draft;
  return <span style={{ background: c.bg, color: c.color, padding: "2px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{c.label}</span>;
};

const Modal = ({ title, onClose, children, wide }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean }) => (
  <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
    <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: wide ? 820 : 560, maxHeight: "92vh", overflow: "auto", boxShadow: "0 25px 60px rgba(0,0,0,0.25)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: "1px solid #e8e4dc", position: "sticky", top: 0, background: "#fff", zIndex: 1 }}>
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, fontFamily: "Georgia, serif" }}>{title}</h3>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#888", padding: 4 }}><Icon d={icons.x} size={20} stroke /></button>
      </div>
      <div style={{ padding: 24 }}>{children}</div>
    </div>
  </div>
);

const inputStyle: CSSProperties = { width: "100%", padding: "10px 14px", border: "1.5px solid #e8e4dc", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit", background: "#fff" };

const Field = ({ label, note, children }: { label: string; note?: string; children: ReactNode }) => (
  <div style={{ marginBottom: 18 }}>
    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#333", marginBottom: 6 }}>{label}</label>
    {children}
    {note && <p style={{ margin: "5px 0 0", fontSize: 11, color: "#aaa" }}>{note}</p>}
  </div>
);

const Btn = ({ children, variant = "primary", onClick, small, icon, disabled, full }: { children: ReactNode; variant?: string; onClick?: () => void; small?: boolean; icon?: string; disabled?: boolean; full?: boolean }) => {
  const v: Record<string, CSSProperties> = {
    primary: { background: disabled ? "#ccc" : "#1a1a1a", color: "#f5f0e8", border: "none" },
    ghost:   { background: "transparent", color: "#555", border: "1.5px solid #e8e4dc" },
    danger:  { background: "#fee2e2", color: "#991b1b", border: "none" },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{ ...(v[variant] ?? v.primary), padding: small ? "7px 14px" : "10px 22px", borderRadius: 8, cursor: disabled ? "not-allowed" : "pointer", fontSize: small ? 12 : 14, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "inherit", opacity: disabled ? 0.65 : 1, width: full ? "100%" : undefined, justifyContent: full ? "center" : undefined }}>
      {icon && <Icon d={icons[icon]} size={small ? 14 : 16} stroke />}{children}
    </button>
  );
};

const Toast = ({ msg, ok, onClose }: { msg: string; ok: boolean; onClose: () => void }) => (
  <div style={{ position: "fixed", top: 24, right: 24, zIndex: 3000, background: ok ? "#166534" : "#991b1b", color: "#fff", padding: "14px 20px", borderRadius: 10, fontSize: 14, fontWeight: 600, maxWidth: 440, boxShadow: "0 8px 32px rgba(0,0,0,0.25)", display: "flex", alignItems: "flex-start", gap: 12 }}>
    <span style={{ flex: 1 }}>{msg}</span>
    <button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.7)", cursor: "pointer", padding: 0, fontSize: 18, lineHeight: 1 }}>×</button>
  </div>
);

// ── CONTACTS ──────────────────────────────────────────────────────────────────
function Contacts({ toast }: { toast: (msg: string, ok?: boolean) => void }) {
  const [contacts, setContacts] = useState<LocalContact[]>([
    { id: 1, name: "Ana García",   email: "ana@ejemplo.com",    list: "Clientes VIP", status: "local" },
    { id: 2, name: "Carlos López", email: "carlos@ejemplo.com", list: "Newsletter",   status: "local" },
    { id: 3, name: "María Torres", email: "maria@ejemplo.com",  list: "Clientes VIP", status: "local" },
  ]);
  const [showImport, setShowImport] = useState(false);
  const [showAdd, setShowAdd]       = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [csvText, setCsvText]       = useState("");
  const [listName, setListName]     = useState("");
  const [uploading, setUploading]   = useState(false);
  const [uploadResult, setUploadResult] = useState<{ listId: number; imported: number; listName: string } | null>(null);
  const [newContact, setNewContact] = useState({ name: "", email: "", list: "Newsletter" });
  const [filterList, setFilterList] = useState("all");
  const fileRef = useRef<HTMLInputElement>(null);

  const lists = ["all", ...Array.from(new Set(contacts.map(c => c.list)))];

  const parseCSV = (text: string): LocalContact[] => {
    const lines = text.trim().split("\n").filter(l => l.trim());
    if (lines.length < 2) return [];
    const headers = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/"/g, ""));
    return lines.slice(1).map((line, i) => {
      const vals = line.split(",").map(v => v.trim().replace(/"/g, ""));
      const obj: Record<string, string> = {};
      headers.forEach((h, idx) => { obj[h] = vals[idx] || ""; });
      return { id: Date.now() + i, name: obj.nombre || obj.name || obj.nombre_completo || "", email: obj.email || obj.correo || "", list: obj.lista || obj.list || "Importados", status: "local" };
    }).filter(c => c.email && c.email.includes("@"));
  };

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setCsvText((ev.target?.result as string) || "");
    reader.readAsText(file);
  };

  const handleImportLocal = () => {
    const parsed = parseCSV(csvText);
    if (!parsed.length) { toast("No se encontraron contactos válidos en el CSV", false); return; }
    setContacts(p => [...p, ...parsed]);
    setShowImport(false); setCsvText("");
    toast(`✅ ${parsed.length} contactos agregados`);
  };

  const handleUploadToBrevo = async () => {
    if (!listName.trim()) { toast("Escribe un nombre para la lista", false); return; }
    const toUpload = filterList === "all" ? contacts : contacts.filter(c => c.list === filterList);
    if (!toUpload.length) { toast("No hay contactos para subir", false); return; }
    setUploading(true);
    try {
      const res = await fetch("/api/import-contacts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ listName: listName.trim(), contacts: toUpload }) });
      const data = await res.json();
      if (data.success) {
        setUploadResult({ listId: data.listId, imported: data.imported, listName: data.listName });
        const emails = new Set(toUpload.map(c => c.email));
        setContacts(p => p.map(c => emails.has(c.email) ? { ...c, status: "synced" } : c));
        toast(`✅ ${data.imported} contactos importados a Brevo — Lista ID: ${data.listId}`);
        setShowUpload(false);
      } else { toast(`❌ ${data.error}`, false); }
    } catch { toast("❌ Error de conexión", false); }
    setUploading(false);
  };

  const visible = filterList === "all" ? contacts : contacts.filter(c => c.list === filterList);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: 28, margin: "0 0 4px" }}>Contactos</h2>
          <p style={{ color: "#888", margin: 0 }}>{contacts.length} contactos · Impórtalos a Brevo para enviar campañas</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Btn variant="ghost" icon="upload" onClick={() => setShowImport(true)}>Importar CSV</Btn>
          <Btn icon="users" onClick={() => setShowUpload(true)}>Subir a Brevo</Btn>
          <Btn icon="plus" onClick={() => setShowAdd(true)}>Añadir</Btn>
        </div>
      </div>

      {uploadResult && (
        <div style={{ background: "#dcfce7", border: "1px solid #bbf7d0", borderRadius: 10, padding: "16px 20px", marginBottom: 20 }}>
          <p style={{ margin: 0, color: "#166534", fontWeight: 700 }}>✅ Lista "{uploadResult.listName}" creada en Brevo</p>
          <p style={{ margin: "6px 0 0", color: "#166534", fontSize: 13 }}>
            {uploadResult.imported} contactos importados · ID de lista: <strong style={{ fontFamily: "monospace", background: "#bbf7d0", padding: "1px 6px", borderRadius: 4 }}>#{uploadResult.listId}</strong>
            {" "}← Usa este número al crear una campaña
          </p>
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {lists.map(l => (
          <button key={l} onClick={() => setFilterList(l)} style={{ padding: "7px 16px", borderRadius: 20, border: "1.5px solid", cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "inherit", background: filterList === l ? "#1a1a1a" : "transparent", color: filterList === l ? "#f5f0e8" : "#555", borderColor: filterList === l ? "#1a1a1a" : "#e8e4dc" }}>
            {l === "all" ? "Todos" : l} {l !== "all" && `(${contacts.filter(c => c.list === l).length})`}
          </button>
        ))}
      </div>

      <div style={{ background: "#fff", border: "1px solid #e8e4dc", borderRadius: 12, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr style={{ background: "#fafaf8", borderBottom: "2px solid #f0ede6" }}>
            {["Nombre", "Email", "Lista", "Estado"].map(h => <th key={h} style={{ textAlign: "left", padding: "12px 16px", fontSize: 11, color: "#888", fontWeight: 700, letterSpacing: 1, fontFamily: "monospace" }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {visible.map(c => (
              <tr key={c.id} style={{ borderBottom: "1px solid #f8f6f2" }}>
                <td style={{ padding: "13px 16px", fontSize: 14, fontWeight: 600 }}>{c.name}</td>
                <td style={{ padding: "13px 16px", fontSize: 13, color: "#555", fontFamily: "monospace" }}>{c.email}</td>
                <td style={{ padding: "13px 16px" }}><span style={{ background: "#f0ede6", padding: "3px 10px", borderRadius: 20, fontSize: 12 }}>{c.list}</span></td>
                <td style={{ padding: "13px 16px" }}>
                  {c.status === "synced"
                    ? <span style={{ background: "#dcfce7", color: "#166534", padding: "2px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>✓ En Brevo</span>
                    : <span style={{ background: "#f1f5f9", color: "#64748b", padding: "2px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>Local</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {visible.length === 0 && <p style={{ textAlign: "center", padding: 40, color: "#aaa" }}>Sin contactos</p>}
      </div>

      {showImport && (
        <Modal title="Importar contactos desde CSV" onClose={() => { setShowImport(false); setCsvText(""); }}>
          <div style={{ background: "#f8f6f2", border: "2px dashed #d4cfc6", borderRadius: 10, padding: 28, textAlign: "center", marginBottom: 20, cursor: "pointer" }} onClick={() => fileRef.current?.click()}>
            <Icon d={icons.upload} size={32} stroke color="#888" />
            <p style={{ color: "#555", margin: "12px 0 4px", fontWeight: 600 }}>Haz clic para seleccionar un archivo CSV</p>
            <p style={{ color: "#aaa", fontSize: 12, margin: 0 }}>Columnas: nombre, email, lista</p>
            <input ref={fileRef} type="file" accept=".csv,.txt" onChange={handleFile} style={{ display: "none" }} />
          </div>
          <Field label="Formato esperado:">
            <pre style={{ background: "#1a1a1a", color: "#a8ff78", padding: 14, borderRadius: 8, fontSize: 12, margin: 0 }}>{`nombre,email,lista\nAna García,ana@empresa.com,Clientes VIP\nCarlos López,carlos@startup.io,Newsletter`}</pre>
          </Field>
          <Field label="O pega el CSV aquí:">
            <textarea value={csvText} onChange={e => setCsvText(e.target.value)} rows={6} style={{ ...inputStyle, resize: "vertical", fontFamily: "monospace", fontSize: 12 }} placeholder={"nombre,email,lista\nAna García,ana@empresa.com,Clientes VIP"} />
          </Field>
          {csvText && <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 8, padding: 12, marginBottom: 16 }}><p style={{ margin: 0, fontSize: 13, color: "#0369a1" }}><strong>{parseCSV(csvText).length}</strong> contactos válidos detectados</p></div>}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <Btn variant="ghost" onClick={() => { setShowImport(false); setCsvText(""); }}>Cancelar</Btn>
            <Btn icon="check" onClick={handleImportLocal} disabled={!csvText.trim()}>Agregar a lista local</Btn>
          </div>
        </Modal>
      )}

      {showUpload && (
        <Modal title="Subir contactos a Brevo" onClose={() => setShowUpload(false)}>
          <div style={{ background: "#fffbeb", border: "1px solid #fef08a", borderRadius: 8, padding: 14, marginBottom: 20 }}>
            <p style={{ margin: 0, fontSize: 13, color: "#854d0e" }}>Se creará una lista nueva en Brevo. Guarda el <strong>ID de lista</strong> que se genera — lo necesitas al crear campañas.</p>
          </div>
          <Field label="Contactos a subir:">
            <select value={filterList} onChange={e => setFilterList(e.target.value)} style={inputStyle}>
              <option value="all">Todos ({contacts.length} contactos)</option>
              {lists.filter(l => l !== "all").map(l => <option key={l} value={l}>{l} ({contacts.filter(c => c.list === l).length})</option>)}
            </select>
          </Field>
          <Field label="Nombre de la lista en Brevo:" note="Ej: Newsletter Mayo 2025, Clientes VIP...">
            <input value={listName} onChange={e => setListName(e.target.value)} placeholder="Clientes VIP" style={inputStyle} />
          </Field>
          <Btn full icon="upload" onClick={handleUploadToBrevo} disabled={uploading || !listName.trim()}>
            {uploading ? "⏳ Subiendo a Brevo..." : "Subir a Brevo ahora"}
          </Btn>
        </Modal>
      )}

      {showAdd && (
        <Modal title="Añadir contacto" onClose={() => setShowAdd(false)}>
          <Field label="Nombre completo"><input value={newContact.name} onChange={e => setNewContact(p => ({ ...p, name: e.target.value }))} placeholder="Ana García" style={inputStyle} /></Field>
          <Field label="Email"><input type="email" value={newContact.email} onChange={e => setNewContact(p => ({ ...p, email: e.target.value }))} placeholder="ana@empresa.com" style={inputStyle} /></Field>
          <Field label="Lista"><input value={newContact.list} onChange={e => setNewContact(p => ({ ...p, list: e.target.value }))} placeholder="Newsletter" style={inputStyle} /></Field>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <Btn variant="ghost" onClick={() => setShowAdd(false)}>Cancelar</Btn>
            <Btn icon="plus" onClick={() => { if (!newContact.name || !newContact.email) return; setContacts(p => [...p, { ...newContact, id: Date.now(), status: "local" }]); setShowAdd(false); setNewContact({ name: "", email: "", list: "Newsletter" }); toast("✅ Contacto añadido"); }} disabled={!newContact.name || !newContact.email}>Añadir</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── CAMPAIGNS ─────────────────────────────────────────────────────────────────
function Campaigns({ config, toast }: { config: Config; toast: (msg: string, ok?: boolean) => void }) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [showNew, setShowNew]     = useState(false);
  const [showPrev, setShowPrev]   = useState<Template | null>(null);
  const [brevoLists, setBrevoLists] = useState<BrevoList[]>([]);
  const [loadingLists, setLoadingLists] = useState(false);
  const [form, setForm] = useState({ name: "", subject: "", preheader: "", listId: "", templateId: "1" });

  const openNew = async () => {
    setShowNew(true); setLoadingLists(true);
    try { const res = await fetch("/api/brevo-lists"); const data = await res.json(); if (data.success && data.lists?.length) setBrevoLists(data.lists); } catch {}
    setLoadingLists(false);
  };

  const handleCreate = () => {
    if (!form.name || !form.subject) return;
    setCampaigns(p => [...p, { ...form, id: Date.now(), status: "draft", sent: 0, opens: 0, clicks: 0, date: new Date().toISOString().split("T")[0], brevoId: null, listName: brevoLists.find(l => String(l.id) === form.listId)?.name ?? `Lista #${form.listId}` }]);
    setShowNew(false); setForm({ name: "", subject: "", preheader: "", listId: "", templateId: "1" });
  };

  const handleSend = async (camp: Campaign) => {
    if (!config.senderEmail || !config.senderName) { toast("⚠️ Configura el remitente en Configuración", false); return; }
    if (!camp.listId) { toast("⚠️ Esta campaña no tiene lista de Brevo asignada", false); return; }
    const tmpl = emailTemplates.find(t => String(t.id) === String(camp.templateId)) ?? emailTemplates[0];
    setCampaigns(p => p.map(c => c.id === camp.id ? { ...c, status: "sending" } : c));
    try {
      const res = await fetch("/api/send-campaign", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ campaignName: camp.name, subject: camp.subject, preheader: camp.preheader ?? "", senderName: config.senderName, senderEmail: config.senderEmail, listId: camp.listId, templateHtml: tmpl.html }) });
      const data = await res.json();
      if (data.success) { setCampaigns(p => p.map(c => c.id === camp.id ? { ...c, status: "sent", brevoId: data.campaignId, date: new Date().toISOString().split("T")[0] } : c)); toast(`✅ Campaña enviada correctamente (ID Brevo: ${data.campaignId})`); }
      else { setCampaigns(p => p.map(c => c.id === camp.id ? { ...c, status: "error" } : c)); toast(`❌ Error: ${data.error}`, false); }
    } catch { setCampaigns(p => p.map(c => c.id === camp.id ? { ...c, status: "error" } : c)); toast("❌ Error de red", false); }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div><h2 style={{ fontFamily: "Georgia, serif", fontSize: 28, margin: "0 0 4px" }}>Campañas</h2><p style={{ color: "#888", margin: 0 }}>Envíos reales a través de la API de Brevo</p></div>
        <Btn icon="plus" onClick={openNew}>Nueva campaña</Btn>
      </div>

      <div style={{ display: "flex", gap: 0, marginBottom: 28, background: "#fff", border: "1px solid #e8e4dc", borderRadius: 12, overflow: "hidden" }}>
        {[{ n: "1", label: "Sube contactos a Brevo", sub: "Contactos → Subir a Brevo", done: true }, { n: "2", label: "Crea la campaña", sub: "Elige lista, asunto y plantilla", done: false }, { n: "3", label: "Envía vía Brevo", sub: "Los emails llegan a tus contactos", done: false }].map((s, i) => (
          <div key={i} style={{ flex: 1, padding: "16px 20px", borderRight: i < 2 ? "1px solid #e8e4dc" : "none", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: s.done ? "#dcfce7" : "#f8f6f2", border: `2px solid ${s.done ? "#166534" : "#e8e4dc"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: s.done ? "#166534" : "#aaa" }}>{s.n}</span>
            </div>
            <div><p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#1a1a1a" }}>{s.label}</p><p style={{ margin: 0, fontSize: 11, color: "#aaa" }}>{s.sub}</p></div>
          </div>
        ))}
      </div>

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

      {showNew && (
        <Modal title="Nueva campaña" onClose={() => setShowNew(false)} wide>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
            <Field label="Nombre de campaña (interno)"><input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Newsletter Mayo 2025" style={inputStyle} /></Field>
            <Field label="Asunto del email"><input value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} placeholder="¡Novedad exclusiva! 🎁" style={inputStyle} /></Field>
          </div>
          <Field label="Preheader" note="Texto que aparece en el cliente de email antes de abrir">
            <input value={form.preheader} onChange={e => setForm(p => ({ ...p, preheader: e.target.value }))} placeholder="Una breve descripción..." style={inputStyle} />
          </Field>
          <Field label={`Lista de Brevo${loadingLists ? " — cargando..." : ""}`} note="Ve a Contactos → Subir a Brevo primero para obtener el ID">
            {brevoLists.length > 0
              ? <select value={form.listId} onChange={e => setForm(p => ({ ...p, listId: e.target.value }))} style={inputStyle}><option value="">Selecciona una lista...</option>{brevoLists.map(l => <option key={l.id} value={String(l.id)}>{l.name} · {l.uniqueSubscribers} suscriptores · ID: {l.id}</option>)}</select>
              : <input value={form.listId} onChange={e => setForm(p => ({ ...p, listId: e.target.value }))} placeholder="Ej: 3  (ID que obtuviste al subir contactos)" style={inputStyle} />}
          </Field>
          <Field label="Plantilla de diseño">
            <select value={form.templateId} onChange={e => setForm(p => ({ ...p, templateId: e.target.value }))} style={inputStyle}>
              {emailTemplates.map(t => <option key={t.id} value={String(t.id)}>{t.name} — {t.category}</option>)}
            </select>
          </Field>
          <div style={{ border: "1px solid #e8e4dc", borderRadius: 10, overflow: "hidden", marginBottom: 20, height: 150, position: "relative", background: "#f8f6f2" }}>
            <div style={{ transform: "scale(0.25)", transformOrigin: "top center", width: 600, position: "absolute", top: 0, left: "50%", marginLeft: -300 }} dangerouslySetInnerHTML={{ __html: emailTemplates.find(t => String(t.id) === form.templateId)?.html ?? "" }} />
          </div>
          <div style={{ background: config.senderEmail ? "#f0f9ff" : "#fffbeb", border: `1px solid ${config.senderEmail ? "#bae6fd" : "#fef08a"}`, borderRadius: 8, padding: 12, marginBottom: 20 }}>
            <p style={{ margin: 0, fontSize: 13, color: config.senderEmail ? "#0369a1" : "#854d0e" }}>
              {config.senderEmail ? <>Remitente: <strong>{config.senderName}</strong> &lt;{config.senderEmail}&gt;</> : <>⚠️ Ve a <strong>Configuración</strong> y agrega el email remitente.</>}
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
          <div style={{ border: "1px solid #e8e4dc", borderRadius: 8, overflow: "hidden" }}><div dangerouslySetInnerHTML={{ __html: showPrev.html }} /></div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}><Btn variant="ghost" onClick={() => setShowPrev(null)}>Cerrar</Btn></div>
        </Modal>
      )}
    </div>
  );
}

// ── TEMPLATES ────────────────────────────────────────────────────────────────
function Templates() {
  const [preview, setPreview] = useState<Template | null>(null);
  return (
    <div>
      <div style={{ marginBottom: 24 }}><h2 style={{ fontFamily: "Georgia, serif", fontSize: 28, margin: "0 0 4px" }}>Plantillas</h2><p style={{ color: "#888", margin: 0 }}>Diseños HTML con variables de Brevo</p></div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 20 }}>
        {emailTemplates.map(t => (
          <div key={t.id} style={{ background: "#fff", border: "1px solid #e8e4dc", borderRadius: 12, overflow: "hidden" }}>
            <div style={{ height: 170, background: "#f8f6f2", overflow: "hidden", position: "relative" }}>
              <div style={{ transform: "scale(0.3)", transformOrigin: "top center", width: 600, position: "absolute", top: 0, left: "50%", marginLeft: -300 }} dangerouslySetInnerHTML={{ __html: t.html }} />
            </div>
            <div style={{ padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <h3 style={{ fontFamily: "Georgia, serif", fontSize: 17, margin: 0 }}>{t.name}</h3>
                <span style={{ fontSize: 11, color: "#888", background: "#f0ede6", padding: "2px 8px", borderRadius: 10 }}>{t.category}</span>
              </div>
              <p style={{ fontSize: 13, color: "#888", margin: "0 0 12px" }}>{t.preview}</p>
              <div style={{ background: "#f8f6f2", borderRadius: 8, padding: 10, marginBottom: 14 }}>
                <p style={{ margin: 0, fontSize: 10, color: "#aaa", fontFamily: "monospace" }}>VARIABLES</p>
                <code style={{ fontSize: 11, color: "#555" }}>{"{{contact.FIRSTNAME}}"} {"{{unsubscribe}}"}</code>
              </div>
              <Btn variant="ghost" small icon="eye" onClick={() => setPreview(t)}>Vista previa</Btn>
            </div>
          </div>
        ))}
      </div>
      {preview && (
        <Modal title={`Vista previa — ${preview.name}`} onClose={() => setPreview(null)} wide>
          <div style={{ border: "1px solid #e8e4dc", borderRadius: 8, overflow: "hidden" }}><div dangerouslySetInnerHTML={{ __html: preview.html }} /></div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}><Btn variant="ghost" onClick={() => setPreview(null)}>Cerrar</Btn></div>
        </Modal>
      )}
    </div>
  );
}

// ── SETTINGS ─────────────────────────────────────────────────────────────────
function Settings({ config, setConfig, toast }: { config: Config; setConfig: (c: Config) => void; toast: (msg: string, ok?: boolean) => void }) {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; account?: { email: string; plan: string }; error?: string } | null>(null);

  const save = () => { localStorage.setItem("mailstudio_config", JSON.stringify(config)); toast("✅ Configuración guardada"); };

  const testConnection = async () => {
    setTesting(true); setTestResult(null);
    try { const res = await fetch("/api/test-brevo"); const data = await res.json(); setTestResult(data.success ? { ok: true, account: data.account } : { ok: false, error: data.error }); }
    catch { setTestResult({ ok: false, error: "No se pudo conectar" }); }
    setTesting(false);
  };

  return (
    <div>
      <div style={{ marginBottom: 32 }}><h2 style={{ fontFamily: "Georgia, serif", fontSize: 28, margin: "0 0 4px" }}>Configuración</h2><p style={{ color: "#888", margin: 0 }}>Conexión con Brevo y datos del remitente</p></div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <div style={{ background: "#fff", border: "1px solid #e8e4dc", borderRadius: 12, padding: 28 }}>
          <h3 style={{ fontFamily: "Georgia, serif", fontSize: 17, margin: "0 0 16px" }}>🔑 Conexión Brevo</h3>
          <div style={{ background: "#fffbeb", border: "1px solid #fef08a", borderRadius: 8, padding: 12, marginBottom: 16 }}>
            <p style={{ margin: 0, fontSize: 12, color: "#854d0e" }}>La API Key va en <strong>Vercel → Settings → Environment Variables → BREVO_API_KEY</strong></p>
          </div>
          <button onClick={testConnection} disabled={testing} style={{ width: "100%", padding: "12px", background: "#1a1a1a", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 600, fontFamily: "inherit", color: "#f5f0e8" }}>
            {testing ? "⏳ Verificando..." : "🔌 Probar conexión con Brevo"}
          </button>
          {testResult && (
            <div style={{ marginTop: 14, padding: 14, borderRadius: 8, background: testResult.ok ? "#dcfce7" : "#fee2e2", color: testResult.ok ? "#166534" : "#991b1b", fontSize: 13 }}>
              {testResult.ok ? <><strong>✅ Conectado</strong><br />Email: {testResult.account?.email}<br />Plan: {testResult.account?.plan}</> : <><strong>❌ Error:</strong> {testResult.error}</>}
            </div>
          )}
        </div>
        <div style={{ background: "#fff", border: "1px solid #e8e4dc", borderRadius: 12, padding: 28 }}>
          <h3 style={{ fontFamily: "Georgia, serif", fontSize: 17, margin: "0 0 16px" }}>✉️ Datos del remitente</h3>
          <Field label="Nombre del remitente"><input value={config.senderName} onChange={e => setConfig({ ...config, senderName: e.target.value })} placeholder="Mi Empresa" style={inputStyle} /></Field>
          <Field label="Email del remitente" note="Debe estar verificado en Brevo → Senders & IP → Senders"><input type="email" value={config.senderEmail} onChange={e => setConfig({ ...config, senderEmail: e.target.value })} placeholder="hola@miempresa.com" style={inputStyle} /></Field>
          <Field label="Reply-To"><input type="email" value={config.replyTo} onChange={e => setConfig({ ...config, replyTo: e.target.value })} placeholder="respuestas@miempresa.com" style={inputStyle} /></Field>
          <Btn icon="check" onClick={save} full>Guardar configuración</Btn>
        </div>
        <div style={{ background: "#1a1a1a", borderRadius: 12, padding: 28, gridColumn: "1 / -1" }}>
          <h3 style={{ fontFamily: "Georgia, serif", fontSize: 17, margin: "0 0 20px", color: "#f5f0e8" }}>🚀 Flujo completo de envío end-to-end</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
            {[{ n: "1", t: "Configurar", d: "Email remitente verificado y guardado aquí" }, { n: "2", t: "Importar contactos", d: "Contactos → CSV → Subir a Brevo → obtén el ID de lista" }, { n: "3", t: "Crear campaña", d: "Campañas → Nueva → elige lista ID, asunto y plantilla" }, { n: "4", t: "Enviar", d: "Clic en Enviar → Brevo API lo procesa y entrega" }].map(s => (
              <div key={s.n} style={{ background: "rgba(255,255,255,0.07)", borderRadius: 10, padding: 16 }}>
                <div style={{ width: 28, height: 28, background: "#f5f0e8", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: "#1a1a1a" }}>{s.n}</span>
                </div>
                <p style={{ margin: "0 0 6px", fontSize: 14, fontWeight: 700, color: "#f5f0e8" }}>{s.t}</p>
                <p style={{ margin: 0, fontSize: 12, color: "#777", lineHeight: 1.6 }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ config }: { config: Config }) {
  const steps = [
    { done: true,                label: "Proyecto desplegado en Vercel" },
    { done: true,                label: "API Key de Brevo configurada en Vercel" },
    { done: !!config.senderEmail, label: "Email remitente configurado y guardado" },
    { done: false,               label: "Contactos subidos a Brevo" },
    { done: false,               label: "Primera campaña enviada" },
  ];
  const done = steps.filter(s => s.done).length;
  return (
    <div>
      <div style={{ marginBottom: 32 }}><h2 style={{ fontFamily: "Georgia, serif", fontSize: 28, margin: "0 0 4px" }}>Panel de control</h2><p style={{ color: "#888", margin: 0 }}>MailStudio · Email Marketing con Brevo API</p></div>
      <div style={{ background: "#fff", border: "1px solid #e8e4dc", borderRadius: 12, padding: 28, marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ fontFamily: "Georgia, serif", fontSize: 18, margin: 0 }}>Checklist de configuración</h3>
          <span style={{ fontSize: 13, color: "#888" }}>{done}/{steps.length} completados</span>
        </div>
        <div style={{ background: "#f0ede6", borderRadius: 20, height: 8, marginBottom: 20 }}>
          <div style={{ background: "#1a1a1a", height: 8, borderRadius: 20, width: `${(done / steps.length) * 100}%`, transition: "width 0.5s" }} />
        </div>
        {steps.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
            <div style={{ width: 26, height: 26, borderRadius: "50%", background: s.done ? "#dcfce7" : "#f8f6f2", border: `2px solid ${s.done ? "#166534" : "#e8e4dc"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {s.done ? <Icon d={icons.check} size={13} stroke color="#166534" /> : <span style={{ fontSize: 11, color: "#ccc" }}>{i + 1}</span>}
            </div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: s.done ? 400 : 600, color: s.done ? "#aaa" : "#1a1a1a", textDecoration: s.done ? "line-through" : "none" }}>{s.label}</p>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 16 }}>
        {[{ l: "PLANTILLAS", v: String(emailTemplates.length), s: "listas para usar" }, { l: "REMITENTE", v: config.senderEmail ? "✓" : "—", s: config.senderEmail || "Ve a Configuración" }, { l: "API BREVO", v: "Activa", s: "via variable de entorno" }].map(({ l, v, s }) => (
          <div key={l} style={{ background: "#fff", border: "1px solid #e8e4dc", borderRadius: 12, padding: "20px 24px" }}>
            <p style={{ margin: 0, fontSize: 11, color: "#aaa", fontFamily: "monospace", letterSpacing: 1 }}>{l}</p>
            <p style={{ margin: "8px 0 4px", fontSize: 26, fontWeight: 800, color: "#1a1a1a", fontFamily: "Georgia, serif" }}>{v}</p>
            <p style={{ margin: 0, fontSize: 12, color: "#aaa" }}>{s}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage]   = useState("dashboard");
  const [config, setConfig] = useState<Config>({ senderName: "", senderEmail: "", replyTo: "" });
  const [toastState, setToastState] = useState<{ msg: string; ok: boolean } | null>(null);

  useEffect(() => { try { const s = localStorage.getItem("mailstudio_config"); if (s) setConfig(JSON.parse(s)); } catch {} }, []);

  const toast = (msg: string, ok = true) => { setToastState({ msg, ok }); setTimeout(() => setToastState(null), 5000); };

  const nav = [
    { id: "dashboard", label: "Panel",        icon: "chart" },
    { id: "campaigns", label: "Campañas",      icon: "send" },
    { id: "contacts",  label: "Contactos",     icon: "users" },
    { id: "templates", label: "Plantillas",    icon: "template" },
    { id: "settings",  label: "Configuración", icon: "settings" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f8f5ef", display: "flex", fontFamily: "'Palatino Linotype', Georgia, serif" }}>
      {toastState && <Toast msg={toastState.msg} ok={toastState.ok} onClose={() => setToastState(null)} />}
      <aside style={{ width: 224, background: "#1a1a1a", display: "flex", flexDirection: "column", position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 100 }}>
        <div style={{ padding: "28px 24px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <div style={{ width: 30, height: 30, background: "#f5f0e8", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon d={icons.mail} size={16} stroke color="#1a1a1a" /></div>
            <span style={{ color: "#f5f0e8", fontSize: 16, fontWeight: 800, letterSpacing: 0.5 }}>MailStudio</span>
          </div>
          <p style={{ color: "#555", fontSize: 10, margin: 0, letterSpacing: 2, fontFamily: "monospace" }}>EMAIL MARKETING</p>
        </div>
        <nav style={{ flex: 1, padding: "8px 12px" }}>
          {nav.map(n => (
            <button key={n.id} onClick={() => setPage(n.id)} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 12px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 14, fontWeight: page === n.id ? 700 : 400, fontFamily: "inherit", textAlign: "left", marginBottom: 3, background: page === n.id ? "rgba(245,240,232,0.13)" : "transparent", color: page === n.id ? "#f5f0e8" : "#777" }}>
              <Icon d={icons[n.icon]} size={16} stroke color={page === n.id ? "#f5f0e8" : "#555"} />
              {n.label}
            </button>
          ))}
        </nav>
        <div style={{ padding: "16px 20px", borderTop: "1px solid #222" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: config.senderEmail ? "#4ade80" : "#f87171", flexShrink: 0 }} />
            <p style={{ color: "#666", fontSize: 12, margin: 0 }}>{config.senderEmail ? "Brevo configurado" : "Sin configurar"}</p>
          </div>
          {config.senderEmail && <p style={{ color: "#444", fontSize: 11, margin: 0, fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{config.senderEmail}</p>}
        </div>
      </aside>
      <main style={{ marginLeft: 224, flex: 1, padding: "40px 48px", minHeight: "100vh" }}>
        {page === "dashboard" && <Dashboard config={config} />}
        {page === "campaigns" && <Campaigns config={config} toast={toast} />}
        {page === "contacts"  && <Contacts toast={toast} />}
        {page === "templates" && <Templates />}
        {page === "settings"  && <Settings config={config} setConfig={setConfig} toast={toast} />}
      </main>
    </div>
  );
}
