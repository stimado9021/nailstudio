// app/api/send-campaign/route.js
// Envía una campaña real usando la API de Brevo

export async function POST(request) {
  try {
    const body = await request.json();
    const { subject, senderName, senderEmail, listId, templateHtml, preheader, campaignName } = body;

    const BREVO_API_KEY = process.env.BREVO_API_KEY;

    if (!BREVO_API_KEY) {
      return Response.json({ error: "API Key de Brevo no configurada" }, { status: 500 });
    }

    // 1. Crear la campaña en Brevo
    const campaignRes = await fetch("https://api.brevo.com/v3/emailCampaigns", {
      method: "POST",
      headers: {
        "api-key": BREVO_API_KEY,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        name: campaignName,
        subject: subject,
        previewText: preheader || "",
        sender: {
          name: senderName,
          email: senderEmail,
        },
        type: "classic",
        htmlContent: templateHtml,
        recipients: {
          listIds: [Number(listId)],
        },
      }),
    });

    const campaignData = await campaignRes.json();

    if (!campaignRes.ok) {
      return Response.json({
        error: campaignData.message || "Error al crear la campaña en Brevo",
        details: campaignData,
      }, { status: campaignRes.status });
    }

    const createdCampaignId = campaignData.id;

    // 2. Enviar la campaña inmediatamente
    const sendRes = await fetch(`https://api.brevo.com/v3/emailCampaigns/${createdCampaignId}/sendNow`, {
      method: "POST",
      headers: {
        "api-key": BREVO_API_KEY,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
    });

    if (!sendRes.ok) {
      const sendErr = await sendRes.json();
      return Response.json({
        error: "Campaña creada pero no se pudo enviar",
        campaignId: createdCampaignId,
        details: sendErr,
      }, { status: sendRes.status });
    }

    return Response.json({
      success: true,
      campaignId: createdCampaignId,
      message: "Campaña enviada correctamente a través de Brevo",
    });

  } catch (err) {
    return Response.json({ error: "Error interno del servidor", details: err.message }, { status: 500 });
  }
}
