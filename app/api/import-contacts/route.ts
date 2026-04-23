// app/api/import-contacts/route.ts
// Crea una lista en Brevo e importa contactos a ella

export async function POST(request: Request) {
  try {
    const { listName, contacts } = await request.json();
    const API_KEY = process.env.BREVO_API_KEY;

    if (!API_KEY) {
      return Response.json({ error: "BREVO_API_KEY no configurada en variables de entorno" }, { status: 500 });
    }

    if (!listName || !contacts || contacts.length === 0) {
      return Response.json({ error: "Nombre de lista y contactos son requeridos" }, { status: 400 });
    }

    // ── 1. Crear lista en Brevo ──────────────────────────────────────────────
    const listRes = await fetch("https://api.brevo.com/v3/contacts/lists", {
      method: "POST",
      headers: {
        "api-key": API_KEY,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({ name: listName, folderId: 1 }),
    });

    const listData = await listRes.json();

    if (!listRes.ok) {
      return Response.json({
        error: `Error creando lista: ${listData.message || "Error desconocido"}`,
        details: listData,
      }, { status: listRes.status });
    }

    const listId: number = listData.id;

    // ── 2. Importar contactos en lotes de 150 ───────────────────────────────
    // La API de Brevo acepta máximo 150 por llamada
    const BATCH = 150;
    let imported = 0;
    let failed = 0;
    const errors: string[] = [];

    for (let i = 0; i < contacts.length; i += BATCH) {
      const batch = contacts.slice(i, i + BATCH);

      const importRes = await fetch("https://api.brevo.com/v3/contacts/import", {
        method: "POST",
        headers: {
          "api-key": API_KEY,
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          listIds: [listId],
          updateEnabled: true,
          jsonBody: batch.map((c: { name: string; email: string; tags?: string[] }) => ({
            email: c.email,
            attributes: {
              FIRSTNAME: c.name?.split(" ")[0] || "",
              LASTNAME:  c.name?.split(" ").slice(1).join(" ") || "",
            },
          })),
        }),
      });

      if (importRes.ok) {
        imported += batch.length;
      } else {
        const err = await importRes.json();
        failed += batch.length;
        errors.push(err.message || "Error en lote");
      }
    }

    return Response.json({
      success: true,
      listId,
      listName,
      imported,
      failed,
      errors: errors.length > 0 ? errors : undefined,
      message: `Lista "${listName}" creada (ID: ${listId}). ${imported} contactos importados${failed > 0 ? `, ${failed} fallaron` : ""}.`,
    });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    return Response.json({ error: "Error interno del servidor", details: message }, { status: 500 });
  }
}
