// app/api/send-campaign/route.ts

export async function POST(request: Request) {
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

    // ── 1. Crear campaña ─────────────────────────────────────────────────────
    const campaignRes = await fetch("https://api.brevo.com/v3/emailCampaigns", {
      method: "POST",
      headers: {
        "api-key": API_KEY,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        name: campaignName,
        subject,
        previewText: preheader || "",
        sender: { name: senderName, email: senderEmail },
        type: "classic",
        htmlContent: templateHtml,
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

    const campaignId: number = campaignData.id;

    // ── 2. Enviar ahora ──────────────────────────────────────────────────────
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
        error: "Campaña creada en Brevo pero no se pudo enviar",
        campaignId,
        details: sendErr,
      }, { status: sendRes.status });
    }

    return Response.json({
      success: true,
      campaignId,
      message: `Campaña enviada correctamente (ID Brevo: ${campaignId})`,
    });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    return Response.json({ error: "Error interno", details: message }, { status: 500 });
  }
}
