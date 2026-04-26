// app/api/send-campaign/route.js

export async function POST(request) {
  try {
    const body = await request.json();
    const { subject, senderName, senderEmail, listId, templateHtml, preheader, campaignName } = body;

    const API_KEY = process.env.BREVO_API_KEY;

    if (!API_KEY) {
      return Response.json({ error: "BREVO_API_KEY no configurada" }, { status: 500 });
    }
    if (!senderEmail || !senderName || !subject || !listId || !templateHtml) {
      return Response.json({ error: "Faltan campos requeridos: senderEmail, senderName, subject, listId, templateHtml" }, { status: 400 });
    }

    // ── 1. Preparar el HTML con variables de Brevo ─────────────────────────────
    // Traducimos tus etiquetas simples al formato de atributos de Brevo
    let finalHtml = templateHtml
      .replace(/{{nombre}}/g, "{{ contact.FIRSTNAME }}")
      .replace(/{{email}}/g, "{{ contact.EMAIL }}");

    // ── 2. Crear campaña en Brevo ─────────────────────────────────────────────
    const campaignRes = await fetch("https://api.brevo.com/v3/emailCampaigns", {
      method: "POST",
      headers: {
        "api-key": API_KEY,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        name: campaignName,
        subject: subject,
        previewText: preheader || "",
        sender: { name: senderName, email: senderEmail },
        type: "classic",
        htmlContent: finalHtml,
        recipients: { listIds: [Number(listId)] },
      }),
    });

    const campaignData = await campaignRes.json();

    if (!campaignRes.ok) {
      return Response.json({
        error: campaignData.message || "Error al crear la campaña en Brevo",
        details: campaignData,
      }, { status: campaignRes.status });
    }

    const campaignId = campaignData.id;

    // ── 2. Enviar ahora ───────────────────────────────────────────────────────
    const sendRes = await fetch(`https://api.brevo.com/v3/emailCampaigns/${campaignId}/sendNow`, {
      method: "POST",
      headers: {
        "api-key": API_KEY,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
    });

    if (!sendRes.ok) {
      const sendErr = await sendRes.json();
      return Response.json({
        error: "Campaña creada pero no se pudo enviar",
        campaignId,
        details: sendErr,
      }, { status: sendRes.status });
    }

    return Response.json({
      success: true,
      campaignId,
      message: "Campaña enviada correctamente a través de Brevo",
    });

  } catch (err) {
    const message = err && err.message ? err.message : "Error desconocido";
    return Response.json({ error: "Error interno", details: message }, { status: 500 });
  }
}
