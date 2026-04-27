"use client";
// app/components/ui.tsx
// Componentes UI reutilizables: Icon, Btn, Modal, Field, Toast, statusBadge

import { ReactNode, CSSProperties } from "react";

// ── Iconos ────────────────────────────────────────────────────────────────────
export const icons: Record<string, string> = {
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
  trash:    "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16",
};

// ── Icon SVG ──────────────────────────────────────────────────────────────────
export function Icon({
  d,
  size = 20,
  color = "currentColor",
  stroke = false,
}: {
  d: string;
  size?: number;
  color?: string;
  stroke?: boolean;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={stroke ? "none" : color}
      stroke={stroke ? color : "none"}
      strokeWidth={stroke ? 2 : 0}
    >
      <path
        d={d}
        strokeLinecap={stroke ? "round" : undefined}
        strokeLinejoin={stroke ? "round" : undefined}
      />
    </svg>
  );
}

// ── Estilos base compartidos ──────────────────────────────────────────────────
export const inputStyle: CSSProperties = {
  width: "100%",
  padding: "12px 16px",
  border: "1.5px solid rgba(197, 160, 115, 0.2)",
  borderRadius: 12,
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "var(--font-outfit), sans-serif",
  background: "rgba(255, 255, 255, 0.5)",
  backdropFilter: "blur(4px)",
  color: "#1a1a1a",
  transition: "all 0.2s",
};

// ── Card Component ────────────────────────────────────────────────────────────
export function Card({ children, style, padding = 24 }: { children: ReactNode; style?: CSSProperties; padding?: number }) {
  return (
    <div
      style={{
        background: "rgba(255, 255, 255, 0.7)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(197, 160, 115, 0.1)",
        borderRadius: 20,
        padding: padding,
        boxShadow: "0 10px 30px rgba(0,0,0,0.03)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ── Field: label + input wrapper ──────────────────────────────────────────────
export function Field({
  label,
  note,
  children,
}: {
  label: string;
  note?: string;
  children: ReactNode;
}) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label
        style={{
          display: "block",
          fontSize: 12,
          fontWeight: 600,
          color: "#C5A073",
          textTransform: "uppercase",
          letterSpacing: 1,
          marginBottom: 8,
        }}
      >
        {label}
      </label>
      {children}
      {note && (
        <p style={{ margin: "6px 0 0", fontSize: 11, color: "#999", fontStyle: "italic" }}>{note}</p>
      )}
    </div>
  );
}

// ── Btn ───────────────────────────────────────────────────────────────────────
export function Btn({
  children,
  variant = "primary",
  onClick,
  small,
  icon,
  disabled,
  full,
}: {
  children: ReactNode;
  variant?: "primary" | "ghost" | "danger" | "success" | "accent";
  onClick?: () => void;
  small?: boolean;
  icon?: string;
  disabled?: boolean;
  full?: boolean;
}) {
  const v: Record<string, CSSProperties> = {
    primary: { background: disabled ? "#ccc" : "#1a1a1a", color: "#FBF8F3", border: "none" },
    accent:  { background: disabled ? "#e8e4dc" : "#C5A073", color: "#fff", border: "none" },
    ghost:   { background: "transparent", color: "#1a1a1a", border: "1.5px solid rgba(197, 160, 115, 0.3)" },
    danger:  { background: "#fee2e2", color: "#991b1b", border: "none" },
    success: { background: "#166534", color: "#fff", border: "none" },
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...(v[variant] ?? v.primary),
        padding: small ? "8px 16px" : "12px 28px",
        borderRadius: 12,
        cursor: disabled ? "not-allowed" : "pointer",
        fontSize: small ? 12 : 14,
        fontWeight: 600,
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        fontFamily: "var(--font-outfit), sans-serif",
        opacity: disabled ? 0.65 : 1,
        width: full ? "100%" : undefined,
        justifyContent: full ? "center" : undefined,
        transition: "all 0.2s",
        boxShadow: variant === "primary" ? "0 4px 12px rgba(0,0,0,0.15)" : "none",
      }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        if (!disabled) e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {icon && <Icon d={icons[icon]} size={small ? 14 : 16} stroke />}
      {children}
    </button>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────
export function Modal({
  title,
  onClose,
  children,
  wide,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(26,26,26,0.4)",
        backdropFilter: "blur(8px)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 24,
          width: "100%",
          maxWidth: wide ? 820 : 560,
          maxHeight: "92vh",
          overflow: "auto",
          boxShadow: "0 40px 100px rgba(0,0,0,0.2)",
          border: "1px solid rgba(197, 160, 115, 0.1)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "24px 32px",
            borderBottom: "1px solid rgba(197, 160, 115, 0.05)",
            position: "sticky",
            top: 0,
            background: "rgba(255,255,255,0.9)",
            backdropFilter: "blur(10px)",
            zIndex: 1,
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: 22,
              fontWeight: 700,
              fontFamily: "var(--font-playfair), serif",
              color: "#1a1a1a",
            }}
          >
            {title}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "rgba(0,0,0,0.05)",
              border: "none",
              cursor: "pointer",
              color: "#888",
              padding: 8,
              borderRadius: "50%",
              display: "flex",
            }}
          >
            <Icon d={icons.x} size={18} stroke />
          </button>
        </div>
        <div style={{ padding: "32px" }}>{children}</div>
      </div>
    </div>
  );
}

// ── Toast ─────────────────────────────────────────────────────────────────────
export function Toast({
  msg,
  ok,
  onClose,
}: {
  msg: string;
  ok: boolean;
  onClose: () => void;
}) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 32,
        right: 32,
        zIndex: 3000,
        background: ok ? "rgba(22, 101, 52, 0.9)" : "rgba(153, 27, 27, 0.9)",
        backdropFilter: "blur(12px)",
        color: "#fff",
        padding: "16px 24px",
        borderRadius: 16,
        fontSize: 14,
        fontWeight: 600,
        maxWidth: 400,
        boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
        display: "flex",
        alignItems: "center",
        gap: 12,
        animation: "slideUp 0.3s ease-out",
      }}
    >
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
      <span style={{ flex: 1 }}>{msg}</span>
      <button
        onClick={onClose}
        style={{
          background: "rgba(255,255,255,0.2)",
          border: "none",
          color: "#fff",
          cursor: "pointer",
          padding: "4px 8px",
          borderRadius: 8,
          fontSize: 12,
        }}
      >
        Cerrar
      </button>
    </div>
  );
}

// ── statusBadge ───────────────────────────────────────────────────────────────
export function statusBadge(s: string) {
  const cfg: Record<string, { bg: string; color: string; label: string }> = {
    sent:    { bg: "#dcfce7", color: "#166534", label: "Enviada" },
    draft:   { bg: "#f1f5f9", color: "#475569", label: "Borrador" },
    sending: { bg: "#dbeafe", color: "#1e40af", label: "Enviando..." },
    error:   { bg: "#fee2e2", color: "#991b1b", label: "Error" },
  };
  const c = cfg[s] ?? cfg.draft;
  return (
    <span
      style={{
        background: c.bg,
        color: c.color,
        padding: "4px 12px",
        borderRadius: 30,
        fontSize: 11,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: 0.5,
      }}
    >
      {c.label}
    </span>
  );
}
