"use client";
// app/components/Settings.tsx

import { useState } from "react";
import { Config } from "./types";
import { Btn, Field, inputStyle } from "./ui";

export default function Settings({
  config,
  setConfig,
  toast,
}: {
  config: Config;
  setConfig: (c: Config) => void;
  toast: (msg: string, ok?: boolean) => void;
}) {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    ok: boolean;
    account?: { email: string; plan: string };
    error?: string;
  } | null>(null);

  const save = () => {
    localStorage.setItem("mailstudio_config", JSON.stringify(config));
    toast("✅ Configuración guardada");
  };

  const testConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res  = await fetch("/api/test-brevo");
      const data = await res.json();
      setTestResult(
        data.success
          ? { ok: true, account: data.account }
          : { ok: false, error: data.error }
      );
    } catch {
      setTestResult({ ok: false, error: "No se pudo conectar con el servidor" });
    }
    setTesting(false);
  };

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontFamily: "Georgia, serif", fontSize: 28, margin: "0 0 4px" }}>
          Configuración
        </h2>
        <p style={{ color: "#888", margin: 0 }}>
          Conexión con Brevo y datos del remitente
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Conexión Brevo */}
        <div style={{ background: "#fff", border: "1px solid #e8e4dc", borderRadius: 12, padding: 28 }}>
          <h3 style={{ fontFamily: "Georgia, serif", fontSize: 17, margin: "0 0 16px" }}>
            🔑 Conexión Brevo
          </h3>

          <div style={{ background: "#fffbeb", border: "1px solid #fef08a", borderRadius: 8, padding: 12, marginBottom: 20 }}>
            <p style={{ margin: 0, fontSize: 12, color: "#854d0e" }}>
              La API Key va en{" "}
              <strong>Vercel → Settings → Environment Variables → BREVO_API_KEY</strong>,
              no aquí en la app.
            </p>
          </div>

          <button
            onClick={testConnection}
            disabled={testing}
            style={{
              width: "100%",
              padding: "12px",
              background: "#1a1a1a",
              border: "none",
              borderRadius: 8,
              cursor: testing ? "not-allowed" : "pointer",
              fontSize: 14,
              fontWeight: 600,
              fontFamily: "inherit",
              color: "#f5f0e8",
              opacity: testing ? 0.7 : 1,
            }}
          >
            {testing ? "⏳ Verificando..." : "🔌 Probar conexión con Brevo"}
          </button>

          {testResult && (
            <div
              style={{
                marginTop: 14,
                padding: 14,
                borderRadius: 8,
                background: testResult.ok ? "#dcfce7" : "#fee2e2",
                color: testResult.ok ? "#166534" : "#991b1b",
                fontSize: 13,
                lineHeight: 1.6,
              }}
            >
              {testResult.ok ? (
                <>
                  <strong>✅ Conectado correctamente</strong>
                  <br />
                  Email: {testResult.account?.email}
                  <br />
                  Plan: {testResult.account?.plan}
                </>
              ) : (
                <>
                  <strong>❌ Error:</strong> {testResult.error}
                </>
              )}
            </div>
          )}
        </div>

        {/* Datos del remitente */}
        <div style={{ background: "#fff", border: "1px solid #e8e4dc", borderRadius: 12, padding: 28 }}>
          <h3 style={{ fontFamily: "Georgia, serif", fontSize: 17, margin: "0 0 16px" }}>
            ✉️ Datos del remitente
          </h3>

          <Field label="Nombre del remitente">
            <input
              value={config.senderName}
              onChange={(e) => setConfig({ ...config, senderName: e.target.value })}
              placeholder="Mi Empresa"
              style={inputStyle}
            />
          </Field>

          <Field
            label="Email del remitente"
            note="Debe estar verificado en Brevo → Senders & IP → Senders"
          >
            <input
              type="email"
              value={config.senderEmail}
              onChange={(e) => setConfig({ ...config, senderEmail: e.target.value })}
              placeholder="hola@miempresa.com"
              style={inputStyle}
            />
          </Field>

          <Field label="Reply-To (respuestas)">
            <input
              type="email"
              value={config.replyTo}
              onChange={(e) => setConfig({ ...config, replyTo: e.target.value })}
              placeholder="respuestas@miempresa.com"
              style={inputStyle}
            />
          </Field>

          <Btn icon="check" onClick={save} full>
            Guardar configuración
          </Btn>
        </div>

        {/* Guía flujo completo */}
        <div
          style={{
            background: "#1a1a1a",
            borderRadius: 12,
            padding: 28,
            gridColumn: "1 / -1",
          }}
        >
          <h3
            style={{
              fontFamily: "Georgia, serif",
              fontSize: 17,
              margin: "0 0 20px",
              color: "#f5f0e8",
            }}
          >
            🚀 Flujo completo de envío end-to-end
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4,1fr)",
              gap: 16,
            }}
          >
            {[
              { n: "1", t: "Configurar",         d: "Email remitente verificado en Brevo y guardado aquí" },
              { n: "2", t: "Importar contactos", d: "Contactos → Excel/CSV → Subir a Brevo → anota el ID de lista" },
              { n: "3", t: "Crear campaña",      d: "Campañas → Nueva → elige lista ID, asunto y plantilla" },
              { n: "4", t: "Enviar",             d: "Clic en Enviar → Brevo API procesa y entrega los emails" },
            ].map((s) => (
              <div
                key={s.n}
                style={{
                  background: "rgba(255,255,255,0.07)",
                  borderRadius: 10,
                  padding: 16,
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    background: "#f5f0e8",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 10,
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 800, color: "#1a1a1a" }}>
                    {s.n}
                  </span>
                </div>
                <p style={{ margin: "0 0 6px", fontSize: 14, fontWeight: 700, color: "#f5f0e8" }}>
                  {s.t}
                </p>
                <p style={{ margin: 0, fontSize: 12, color: "#777", lineHeight: 1.6 }}>
                  {s.d}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
