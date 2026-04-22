// app/api/test-brevo/route.js
// Verifica que la API Key sea válida

export async function GET() {
  try {
    const BREVO_API_KEY = process.env.BREVO_API_KEY;

    if (!BREVO_API_KEY) {
      return Response.json({ error: "API Key no encontrada en .env.local" }, { status: 400 });
    }

    const res = await fetch("https://api.brevo.com/v3/account", {
      headers: {
        "api-key": BREVO_API_KEY,
        "Accept": "application/json",
      },
    });

    const data = await res.json();

    if (!res.ok) {
      return Response.json({ error: "API Key inválida", details: data }, { status: 401 });
    }

    return Response.json({
      success: true,
      account: {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        plan: data.plan?.[0]?.type || "unknown",
      },
    });

  } catch (err) {
    return Response.json({ error: "No se pudo conectar con Brevo", details: err.message }, { status: 500 });
  }
}
