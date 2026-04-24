// app/components/emailTemplates.ts
// Plantillas HTML de email compatibles con variables de Brevo

import { EmailTemplate } from "./types";

export const emailTemplates: EmailTemplate[] = [
  {
    id: 1,
    name: "Bienvenida",
    category: "Onboarding",
    preview: "Email de bienvenida con llamada a la acción",
    html: `<div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;background:#fafaf8;border:1px solid #e5e5e0">
  <div style="background:#1a1a1a;padding:32px;text-align:center">
    <h1 style="color:#f5f0e8;font-size:28px;margin:0;letter-spacing:2px">BIENVENIDO</h1>
  </div>
  <div style="padding:40px">
    <p style="font-size:18px;color:#2a2a2a;margin:0 0 16px">Hola <strong>{{contact.FIRSTNAME}}</strong>,</p>
    <p style="color:#555;line-height:1.8;margin:0 0 32px">Gracias por unirte a nuestra comunidad. Estamos emocionados de tenerte con nosotros.</p>
    <div style="text-align:center">
      <a href="https://tuempresa.com" style="background:#1a1a1a;color:#f5f0e8;padding:14px 32px;text-decoration:none;font-size:14px;letter-spacing:1px;display:inline-block">COMENZAR AHORA</a>
    </div>
  </div>
  <div style="background:#f0ede6;padding:20px;text-align:center;font-size:12px;color:#888">
    © 2025 Tu Empresa. <a href="{{unsubscribe}}" style="color:#888">Darse de baja</a>
  </div>
</div>`,
  },
  {
    id: 2,
    name: "Promoción",
    category: "Marketing",
    preview: "Oferta especial con descuento destacado",
    html: `<div style="font-family:'Trebuchet MS',sans-serif;max-width:600px;margin:0 auto;background:#fff">
  <div style="background:linear-gradient(135deg,#e63946,#c1121f);padding:48px;text-align:center">
    <p style="color:rgba(255,255,255,0.8);font-size:13px;letter-spacing:3px;margin:0 0 8px">OFERTA ESPECIAL</p>
    <h1 style="color:#fff;font-size:56px;margin:0;font-weight:900">-30%</h1>
    <p style="color:rgba(255,255,255,0.9);font-size:16px;margin:8px 0 0">Solo por tiempo limitado</p>
  </div>
  <div style="padding:40px;text-align:center">
    <p style="font-size:16px;color:#333;margin:0 0 24px">Hola <strong>{{contact.FIRSTNAME}}</strong>, oferta exclusiva para ti.</p>
    <a href="https://tuempresa.com/oferta" style="display:inline-block;background:#e63946;color:#fff;padding:16px 40px;text-decoration:none;font-weight:bold;font-size:16px;border-radius:4px">APROVECHAR OFERTA</a>
  </div>
  <div style="padding:20px;text-align:center;font-size:12px;color:#aaa">
    <a href="{{unsubscribe}}" style="color:#aaa">Darse de baja</a>
  </div>
</div>`,
  },
  {
    id: 3,
    name: "Newsletter",
    category: "Newsletter",
    preview: "Newsletter informativo con artículo destacado",
    html: `<div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;background:#fff">
  <div style="border-bottom:3px solid #2d4a3e;padding:24px">
    <span style="font-size:22px;font-weight:bold;color:#2d4a3e">TU NEWSLETTER</span>
  </div>
  <div style="padding:32px">
    <h2 style="color:#2d4a3e;font-size:22px;margin:0 0 16px">Hola {{contact.FIRSTNAME}},</h2>
    <div style="border-left:4px solid #a8c5bb;padding-left:16px;margin:24px 0">
      <h3 style="color:#2d4a3e;margin:0 0 8px">Artículo destacado</h3>
      <p style="color:#555;line-height:1.8;margin:0 0 12px">Descripción del contenido principal de esta edición.</p>
      <a href="https://tuempresa.com/blog" style="color:#2d4a3e;font-size:13px;font-weight:bold;text-decoration:none">Leer más →</a>
    </div>
  </div>
  <div style="background:#f0ede6;padding:20px;text-align:center;font-size:12px;color:#888">
    <a href="{{unsubscribe}}" style="color:#888">Darse de baja</a>
  </div>
</div>`,
  },
  {
    id: 4,
    name: "Reactivación",
    category: "Retención",
    preview: "Recupera contactos inactivos con incentivo",
    html: `<div style="font-family:'Helvetica Neue',sans-serif;max-width:600px;margin:0 auto;background:#f8f4ff">
  <div style="padding:48px;text-align:center">
    <div style="font-size:60px;margin-bottom:16px">💌</div>
    <h1 style="color:#4a1d96;font-size:28px;margin:0 0 16px">Te echamos de menos</h1>
    <p style="color:#6b21a8;font-size:16px;line-height:1.8;margin:0 0 32px">Hola <strong>{{contact.FIRSTNAME}}</strong>, tenemos novedades para ti.</p>
    <a href="https://tuempresa.com" style="display:inline-block;background:#7c3aed;color:#fff;padding:14px 36px;text-decoration:none;border-radius:50px;font-size:15px;font-weight:bold">Volver a conectar</a>
  </div>
  <div style="padding:20px;text-align:center;font-size:12px;color:#aaa">
    <a href="{{unsubscribe}}" style="color:#aaa">Darse de baja</a>
  </div>
</div>`,
  },
];
