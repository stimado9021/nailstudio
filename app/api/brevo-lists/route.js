// app/api/brevo-lists/route.js
// Obtiene las listas de contactos reales de tu cuenta Brevo

export async function GET() {
  try {
    const BREVO_API_KEY = process.env.BREVO_API_KEY;

    if (!BREVO_API_KEY) {
      return Response.json({ error: "API Key de Brevo no configurada" }, { status: 500 });
    }

    const res = await fetch("https://api.brevo.com/v3/contacts/lists?limit=50&offset=0", {
      headers: {
        "api-key": BREVO_API_KEY,
        "Accept": "application/json",
      },
    });

    const data = await res.json();

    if (!res.ok) {
      return Response.json({ error: data.message || "Error al obtener listas" }, { status: res.status });
    }

    return Response.json({
      success: true,
      lists: data.lists || [],
      count: data.count,
    });

  } catch (err) {
    return Response.json({ error: "Error interno", details: err.message }, { status: 500 });
  }
}
