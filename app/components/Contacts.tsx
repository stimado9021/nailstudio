"use client";
// app/components/Contacts.tsx
// Importa Excel/CSV con SheetJS y sube contactos a Brevo
// Cuando crea una lista en Brevo, notifica al padre via onListCreated()

import { useState, useRef, ChangeEvent } from "react";
import { LocalContact, UploadResult, BrevoList } from "./types";
import { Btn, Field, Modal, Icon, icons, inputStyle } from "./ui";

declare const XLSX: any;

const DEMO_CONTACTS: LocalContact[] = [
  { id: 1, name: "Ana García",   email: "ana@ejemplo.com",    list: "Clientes VIP", status: "local" },
  { id: 2, name: "Carlos López", email: "carlos@ejemplo.com", list: "Newsletter",   status: "local" },
  { id: 3, name: "María Torres", email: "maria@ejemplo.com",  list: "Clientes VIP", status: "local" },
];

export default function Contacts({
  toast,
  onListCreated,
}: {
  toast: (msg: string, ok?: boolean) => void;
  onListCreated: (list: BrevoList) => void;
}) {
  const [contacts, setContacts]           = useState<LocalContact[]>(DEMO_CONTACTS);
  const [showImport, setShowImport]       = useState(false);
  const [showAdd, setShowAdd]             = useState(false);
  const [showUpload, setShowUpload]       = useState(false);
  const [csvText, setCsvText]             = useState("");
  const [listName, setListName]           = useState("");
  const [uploading, setUploading]         = useState(false);
  const [parsedPreview, setParsedPreview] = useState<LocalContact[]>([]);
  const [uploadResult, setUploadResult]   = useState<UploadResult | null>(null);
  const [newContact, setNewContact]       = useState({ name: "", email: "", list: "Newsletter" });
  const [filterList, setFilterList]       = useState("all");
  const [importMode, setImportMode]       = useState<"excel" | "csv">("excel");
  const fileRef = useRef<HTMLInputElement>(null);

  const lists   = ["all", ...Array.from(new Set(contacts.map(c => c.list)))];
  const visible = filterList === "all" ? contacts : contacts.filter(c => c.list === filterList);

  // ── Leer Excel con SheetJS ──────────────────────────────────────────────────
  const readExcel = (file: File): Promise<LocalContact[]> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => {
        try {
          const data  = new Uint8Array(e.target?.result as ArrayBuffer);
          const wb    = XLSX.read(data, { type: "array" });
          const sheet = wb.Sheets[wb.SheetNames[0]];
          const rows: Record<string, string>[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });

          const get = (row: Record<string, string>, ...names: string[]) => {
            for (const n of names) {
              const k = Object.keys(row).find(k => k.toLowerCase().trim() === n);
              if (k && row[k]) return String(row[k]).trim();
            }
            return "";
          };

          resolve(rows.map((row, i) => ({
            id:     Date.now() + i,
            name:   get(row, "nombre", "name", "nombre_completo", "full name", "firstname"),
            email:  get(row, "email", "correo", "e-mail", "mail"),
            list:   get(row, "lista", "list", "grupo", "group", "segmento") || "Importados",
            status: "local" as const,
          })).filter(c => c.email && c.email.includes("@")));
        } catch (err) { reject(err); }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });

  // ── Leer CSV ────────────────────────────────────────────────────────────────
  const parseCSV = (text: string): LocalContact[] => {
    const lines = text.trim().split("\n").filter(l => l.trim());
    if (lines.length < 2) return [];
    const headers = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/"/g, ""));
    return lines.slice(1).map((line, i) => {
      const vals = line.split(",").map(v => v.trim().replace(/"/g, ""));
      const obj: Record<string, string> = {};
      headers.forEach((h, idx) => { obj[h] = vals[idx] || ""; });
      return {
        id: Date.now() + i,
        name:   obj.nombre || obj.name || obj.nombre_completo || "",
        email:  obj.email  || obj.correo || "",
        list:   obj.lista  || obj.list   || "Importados",
        status: "local" as const,
      };
    }).filter(c => c.email && c.email.includes("@"));
  };

  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (/\.(xlsx|xls|xlsm)$/i.test(file.name)) {
      try {
        const parsed = await readExcel(file);
        setParsedPreview(parsed);
        setCsvText("");
        toast(`📊 ${parsed.length} contactos detectados en el Excel`);
      } catch {
        toast("❌ No se pudo leer el Excel. Verifica el formato.", false);
      }
    } else {
      const reader = new FileReader();
      reader.onload = ev => {
        const text = (ev.target?.result as string) || "";
        setCsvText(text);
        setParsedPreview(parseCSV(text));
      };
      reader.readAsText(file);
    }
    e.target.value = "";
  };

  const handleImportLocal = () => {
    const toAdd = parsedPreview.length > 0 ? parsedPreview : parseCSV(csvText);
    if (!toAdd.length) { toast("No se encontraron contactos válidos", false); return; }
    setContacts(p => [...p, ...toAdd]);
    setShowImport(false);
    setCsvText(""); setParsedPreview([]);
    toast(`✅ ${toAdd.length} contactos agregados`);
  };

  // ── Subir a Brevo y notificar al padre ──────────────────────────────────────
  const handleUploadToBrevo = async () => {
    if (!listName.trim()) { toast("Escribe un nombre para la lista", false); return; }
    const toUpload = filterList === "all" ? contacts : contacts.filter(c => c.list === filterList);
    if (!toUpload.length) { toast("No hay contactos para subir", false); return; }

    setUploading(true);
    try {
      const res  = await fetch("/api/import-contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listName: listName.trim(), contacts: toUpload }),
      });
      const data = await res.json();

      if (data.success) {
        const result: UploadResult = { listId: data.listId, imported: data.imported, listName: data.listName };
        setUploadResult(result);

        // Marcar contactos como sincronizados
        const emails = new Set(toUpload.map(c => c.email));
        setContacts(p => p.map(c => emails.has(c.email) ? { ...c, status: "synced" } : c));

        // ← Notifica al padre (page.tsx) para que Campaigns la vea
        onListCreated({ id: data.listId, name: data.listName, uniqueSubscribers: data.imported });

        toast(`✅ ${data.imported} contactos en Brevo — Lista ID: ${data.listId}`);
        setShowUpload(false);
        setListName("");
      } else {
        toast(`❌ ${data.error}`, false);
      }
    } catch {
      toast("❌ Error de conexión con el servidor", false);
    }
    setUploading(false);
  };

  const resetImport = () => { setShowImport(false); setCsvText(""); setParsedPreview([]); };

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: 28, margin: "0 0 4px" }}>Contactos</h2>
          <p style={{ color: "#888", margin: 0 }}>{contacts.length} contactos · Importa Excel o CSV y súbelos a Brevo</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Btn variant="ghost" icon="upload" onClick={() => setShowImport(true)}>Importar Excel / CSV</Btn>
          <Btn icon="users" onClick={() => setShowUpload(true)}>Subir a Brevo</Btn>
          <Btn icon="plus" onClick={() => setShowAdd(true)}>Añadir</Btn>
        </div>
      </div>

      {/* Resultado upload */}
      {uploadResult && (
        <div style={{ background: "#dcfce7", border: "1px solid #bbf7d0", borderRadius: 10, padding: "16px 20px", marginBottom: 20 }}>
          <p style={{ margin: 0, color: "#166534", fontWeight: 700 }}>✅ Lista "{uploadResult.listName}" creada en Brevo</p>
          <p style={{ margin: "6px 0 0", color: "#166534", fontSize: 13 }}>
            {uploadResult.imported} contactos importados · ID de lista:{" "}
            <strong style={{ fontFamily: "monospace", background: "#bbf7d0", padding: "1px 8px", borderRadius: 4 }}>#{uploadResult.listId}</strong>
            {" "}· <strong>Ya puedes ir a Campañas y seleccionar esta lista</strong>
          </p>
        </div>
      )}

      {/* Filtros */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {lists.map(l => (
          <button key={l} onClick={() => setFilterList(l)}
            style={{ padding: "7px 16px", borderRadius: 20, border: "1.5px solid", cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "inherit", background: filterList === l ? "#1a1a1a" : "transparent", color: filterList === l ? "#f5f0e8" : "#555", borderColor: filterList === l ? "#1a1a1a" : "#e8e4dc" }}>
            {l === "all" ? "Todos" : l} {l !== "all" && `(${contacts.filter(c => c.list === l).length})`}
          </button>
        ))}
      </div>

      {/* Tabla */}
      <div style={{ background: "#fff", border: "1px solid #e8e4dc", borderRadius: 12, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#fafaf8", borderBottom: "2px solid #f0ede6" }}>
              {["Nombre", "Email", "Lista", "Estado"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "12px 16px", fontSize: 11, color: "#888", fontWeight: 700, letterSpacing: 1, fontFamily: "monospace" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map(c => (
              <tr key={c.id} style={{ borderBottom: "1px solid #f8f6f2" }}>
                <td style={{ padding: "13px 16px", fontSize: 14, fontWeight: 600 }}>{c.name}</td>
                <td style={{ padding: "13px 16px", fontSize: 13, color: "#555", fontFamily: "monospace" }}>{c.email}</td>
                <td style={{ padding: "13px 16px" }}>
                  <span style={{ background: "#f0ede6", padding: "3px 10px", borderRadius: 20, fontSize: 12 }}>{c.list}</span>
                </td>
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

      {/* ── MODAL IMPORTAR ── */}
      {showImport && (
        <Modal title="Importar contactos" onClose={resetImport} wide>
          <div style={{ display: "flex", gap: 0, marginBottom: 24, background: "#f8f6f2", borderRadius: 10, padding: 4 }}>
            {(["excel", "csv"] as const).map(m => (
              <button key={m} onClick={() => { setImportMode(m); setCsvText(""); setParsedPreview([]); }}
                style={{ flex: 1, padding: "9px 0", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "inherit", background: importMode === m ? "#1a1a1a" : "transparent", color: importMode === m ? "#f5f0e8" : "#888" }}>
                {m === "excel" ? "📊 Archivo Excel (.xlsx)" : "📄 Texto CSV"}
              </button>
            ))}
          </div>

          {importMode === "excel" ? (
            <>
              <div style={{ background: "#f0f9ff", border: "2px dashed #93c5fd", borderRadius: 12, padding: 36, textAlign: "center", marginBottom: 20, cursor: "pointer" }}
                onClick={() => fileRef.current?.click()}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📊</div>
                <p style={{ color: "#1d4ed8", fontWeight: 700, margin: "0 0 6px", fontSize: 16 }}>Haz clic para seleccionar tu archivo Excel</p>
                <p style={{ color: "#93c5fd", fontSize: 13, margin: 0 }}>Formatos: .xlsx · .xls · .xlsm · .csv</p>
                <input ref={fileRef} type="file" accept=".xlsx,.xls,.xlsm,.csv,.txt" onChange={handleFile} style={{ display: "none" }} />
              </div>
              <div style={{ background: "#fafaf8", border: "1px solid #e8e4dc", borderRadius: 10, padding: 16, marginBottom: 20 }}>
                <p style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 600, color: "#333" }}>📋 Columnas que detecta automáticamente:</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                  {[{ col: "Nombre", examples: "nombre, name, firstname" }, { col: "Email", examples: "email, correo, e-mail, mail" }, { col: "Lista", examples: "lista, list, grupo, segmento" }].map(({ col, examples }) => (
                    <div key={col} style={{ background: "#fff", border: "1px solid #e8e4dc", borderRadius: 8, padding: 10 }}>
                      <p style={{ margin: "0 0 4px", fontSize: 12, fontWeight: 700, color: "#1a1a1a" }}>{col}</p>
                      <p style={{ margin: 0, fontSize: 11, color: "#aaa", fontFamily: "monospace" }}>{examples}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <Field label="Pega el CSV aquí:" note="Primera fila = encabezados">
                <textarea value={csvText} onChange={e => { setCsvText(e.target.value); setParsedPreview(parseCSV(e.target.value)); }} rows={8}
                  style={{ ...inputStyle, resize: "vertical", fontFamily: "monospace", fontSize: 12 }}
                  placeholder={"nombre,email,lista\nAna García,ana@empresa.com,Clientes VIP"} />
              </Field>
              <input ref={fileRef} type="file" accept=".csv,.txt,.xlsx,.xls" onChange={handleFile} style={{ display: "none" }} />
            </>
          )}

          {parsedPreview.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ background: "#dcfce7", border: "1px solid #bbf7d0", borderRadius: 8, padding: "12px 16px", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <p style={{ margin: 0, color: "#166534", fontWeight: 600, fontSize: 14 }}>✅ {parsedPreview.length} contactos válidos detectados</p>
                <span style={{ fontSize: 12, color: "#166534" }}>{Array.from(new Set(parsedPreview.map(c => c.list))).join(", ")}</span>
              </div>
              <div style={{ background: "#fafaf8", borderRadius: 8, overflow: "hidden", border: "1px solid #e8e4dc" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead><tr style={{ background: "#f0ede6" }}>
                    {["Nombre", "Email", "Lista"].map(h => <th key={h} style={{ textAlign: "left", padding: "8px 12px", fontSize: 11, color: "#888", fontWeight: 700, fontFamily: "monospace" }}>{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {parsedPreview.slice(0, 5).map((c, i) => (
                      <tr key={i} style={{ borderTop: "1px solid #e8e4dc" }}>
                        <td style={{ padding: "8px 12px", fontSize: 13 }}>{c.name || <em style={{ color: "#ccc" }}>sin nombre</em>}</td>
                        <td style={{ padding: "8px 12px", fontSize: 12, fontFamily: "monospace", color: "#555" }}>{c.email}</td>
                        <td style={{ padding: "8px 12px" }}><span style={{ background: "#f0ede6", padding: "2px 8px", borderRadius: 12, fontSize: 11 }}>{c.list}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {parsedPreview.length > 5 && <p style={{ textAlign: "center", padding: "8px", color: "#aaa", fontSize: 12, margin: 0, borderTop: "1px solid #e8e4dc" }}>... y {parsedPreview.length - 5} más</p>}
              </div>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <Btn variant="ghost" onClick={resetImport}>Cancelar</Btn>
            <Btn icon="check" onClick={handleImportLocal} disabled={parsedPreview.length === 0 && !csvText.trim()}>
              Agregar {parsedPreview.length > 0 ? `${parsedPreview.length} contactos` : ""} a lista local
            </Btn>
          </div>
        </Modal>
      )}

      {/* ── MODAL SUBIR A BREVO ── */}
      {showUpload && (
        <Modal title="Subir contactos a Brevo" onClose={() => setShowUpload(false)}>
          <div style={{ background: "#fffbeb", border: "1px solid #fef08a", borderRadius: 8, padding: 14, marginBottom: 20 }}>
            <p style={{ margin: 0, fontSize: 13, color: "#854d0e" }}>
              Se creará una lista en Brevo. Una vez creada, <strong>podrás seleccionarla directamente en Campañas</strong>.
            </p>
          </div>
          <Field label="Contactos a subir:">
            <select value={filterList} onChange={e => setFilterList(e.target.value)} style={inputStyle}>
              <option value="all">Todos ({contacts.length} contactos)</option>
              {lists.filter(l => l !== "all").map(l => (
                <option key={l} value={l}>{l} ({contacts.filter(c => c.list === l).length} contactos)</option>
              ))}
            </select>
          </Field>
          <Field label="Nombre de la lista en Brevo:" note="Ej: Newsletter Mayo 2025, Clientes VIP...">
            <input value={listName} onChange={e => setListName(e.target.value)} placeholder="Clientes VIP" style={inputStyle} />
          </Field>
          <div style={{ background: "#f8f6f2", borderRadius: 8, padding: 14, marginBottom: 20 }}>
            <p style={{ margin: 0, fontSize: 13, color: "#555" }}>
              Se subirán <strong>{filterList === "all" ? contacts.length : contacts.filter(c => c.list === filterList).length}</strong> contactos como lista <strong>"{listName || "sin nombre"}"</strong>
            </p>
          </div>
          <Btn full icon="upload" onClick={handleUploadToBrevo} disabled={uploading || !listName.trim()}>
            {uploading ? "⏳ Subiendo a Brevo..." : "Subir a Brevo ahora"}
          </Btn>
        </Modal>
      )}

      {/* ── MODAL AÑADIR MANUAL ── */}
      {showAdd && (
        <Modal title="Añadir contacto" onClose={() => setShowAdd(false)}>
          <Field label="Nombre completo">
            <input value={newContact.name} onChange={e => setNewContact(p => ({ ...p, name: e.target.value }))} placeholder="Ana García" style={inputStyle} />
          </Field>
          <Field label="Email">
            <input type="email" value={newContact.email} onChange={e => setNewContact(p => ({ ...p, email: e.target.value }))} placeholder="ana@empresa.com" style={inputStyle} />
          </Field>
          <Field label="Lista">
            <input value={newContact.list} onChange={e => setNewContact(p => ({ ...p, list: e.target.value }))} placeholder="Newsletter" style={inputStyle} />
          </Field>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <Btn variant="ghost" onClick={() => setShowAdd(false)}>Cancelar</Btn>
            <Btn icon="plus" disabled={!newContact.name || !newContact.email} onClick={() => {
              setContacts(p => [...p, { ...newContact, id: Date.now(), status: "local" }]);
              setShowAdd(false);
              setNewContact({ name: "", email: "", list: "Newsletter" });
              toast("✅ Contacto añadido");
            }}>Añadir contacto</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
