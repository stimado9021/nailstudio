// app/api/test-brevo/route.js

export async function GET() {
  try {
    const API_KEY = process.env.BREVO_API_KEY;

    if (!API_KEY) {
      return Response.json({ error: "BREVO_API_KEY no encontrada en variables de entorno" }, { status: 400 });
    }

    const res = await fetch("https://api.brevo.com/v3/account", {
      headers: {
        "api-key": API_KEY,
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
        plan: data.plan && data.plan[0] ? data.plan[0].type : "free",
      },
    });

  } catch (err) {
    const message = err && err.message ? err.message : "Error desconocido";
    return Response.json({ error: "No se pudo conectar con Brevo", details: message }, { status: 500 });
  }
}
