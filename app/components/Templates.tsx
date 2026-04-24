"use client";
// app/components/Templates.tsx

import { useState } from "react";
import { EmailTemplate } from "./types";
import { emailTemplates } from "./emailTemplates";
import { Btn, Modal } from "./ui";

export default function Templates() {
  const [preview, setPreview] = useState<EmailTemplate | null>(null);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: "Georgia, serif", fontSize: 28, margin: "0 0 4px" }}>
          Plantillas
        </h2>
        <p style={{ color: "#888", margin: 0 }}>
          Diseños HTML listos con variables de Brevo integradas
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))",
          gap: 20,
        }}
      >
        {emailTemplates.map((t) => (
          <div
            key={t.id}
            style={{
              background: "#fff",
              border: "1px solid #e8e4dc",
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            {/* Mini preview */}
            <div
              style={{
                height: 170,
                background: "#f8f6f2",
                overflow: "hidden",
                position: "relative",
              }}
            >
              <div
                style={{
                  transform: "scale(0.3)",
                  transformOrigin: "top center",
                  width: 600,
                  position: "absolute",
                  top: 0,
                  left: "50%",
                  marginLeft: -300,
                }}
                dangerouslySetInnerHTML={{ __html: t.html }}
              />
            </div>

            <div style={{ padding: 20 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 8,
                }}
              >
                <h3
                  style={{
                    fontFamily: "Georgia, serif",
                    fontSize: 17,
                    margin: 0,
                  }}
                >
                  {t.name}
                </h3>
                <span
                  style={{
                    fontSize: 11,
                    color: "#888",
                    background: "#f0ede6",
                    padding: "2px 8px",
                    borderRadius: 10,
                    flexShrink: 0,
                    marginLeft: 8,
                  }}
                >
                  {t.category}
                </span>
              </div>

              <p
                style={{
                  fontSize: 13,
                  color: "#888",
                  margin: "0 0 12px",
                  lineHeight: 1.5,
                }}
              >
                {t.preview}
              </p>

              {/* Variables disponibles */}
              <div
                style={{
                  background: "#f8f6f2",
                  borderRadius: 8,
                  padding: 10,
                  marginBottom: 14,
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: 10,
                    color: "#aaa",
                    fontFamily: "monospace",
                    marginBottom: 4,
                  }}
                >
                  VARIABLES DISPONIBLES
                </p>
                <code style={{ fontSize: 11, color: "#555" }}>
                  {"{{contact.FIRSTNAME}}"}
                </code>
                <br />
                <code style={{ fontSize: 11, color: "#555" }}>
                  {"{{unsubscribe}}"}
                </code>
              </div>

              <Btn variant="ghost" small icon="eye" onClick={() => setPreview(t)}>
                Vista previa
              </Btn>
            </div>
          </div>
        ))}
      </div>

      {/* Modal preview */}
      {preview && (
        <Modal
          title={`Vista previa — ${preview.name}`}
          onClose={() => setPreview(null)}
          wide
        >
          <div
            style={{
              border: "1px solid #e8e4dc",
              borderRadius: 8,
              overflow: "hidden",
            }}
          >
            <div dangerouslySetInnerHTML={{ __html: preview.html }} />
          </div>
          <div
            style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}
          >
            <Btn variant="ghost" onClick={() => setPreview(null)}>
              Cerrar
            </Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
