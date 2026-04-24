// app/api/import-contacts/route.ts
// 1. Guarda contactos en Supabase
// 2. Crea lista en Brevo e importa contactos
// 3. Actualiza estado en Supabase con el brevo_list_id

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    const { listName, contacts } = await request.json();
    const API_KEY = process.env.BREVO_API_KEY;

    if (!API_KEY) {
      return Response.json({ error: "BREVO_API_KEY no configurada" }, { status: 500 });
    }
    if (!listName || !contacts?.length) {
      return Response.json({ error: "Nombre de lista y contactos son requeridos" }, { status: 400 });
    }

    // ── 1. Guardar contactos en Supabase ─────────────────────────────────────
    const contactsToInsert = contacts.map((c: { name: string; email: string; list: string }) => ({
      name:      c.name,
      email:     c.email,
      list_name: listName,
      status:    "local",
    }));

    const { error: insertError } = await supabase
      .from("contacts")
      .upsert(contactsToInsert, { onConflict: "email" });

    if (insertError) {
      console.error("Supabase insert error:", insertError);
      // No bloqueamos el flujo — igual intentamos subir a Brevo
    }

    // ── 2. Crear lista en Brevo ───────────────────────────────────────────────
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
        error: `Error creando lista en Brevo: ${listData.message || "Error desconocido"}`,
      }, { status: listRes.status });
    }

    const listId: number = listData.id;

    // ── 3. Importar contactos a Brevo en lotes de 150 ────────────────────────
    const BATCH = 150;
    let imported = 0;

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
          jsonBody: batch.map((c: { name: string; email: string }) => ({
            email: c.email,
            attributes: {
              FIRSTNAME: c.name?.split(" ")[0] || "",
              LASTNAME:  c.name?.split(" ").slice(1).join(" ") || "",
            },
          })),
        }),
      });

      if (importRes.ok) imported += batch.length;
    }

    // ── 4. Actualizar estado en Supabase con brevo_list_id ───────────────────
    await supabase
      .from("contacts")
      .update({ status: "synced", brevo_list_id: listId })
      .eq("list_name", listName);

    // ── 5. Guardar la lista de Brevo en Supabase ─────────────────────────────
    await supabase
      .from("brevo_lists")
      .upsert({ id: listId, name: listName, unique_subscribers: imported });

    return Response.json({
      success: true,
      listId,
      listName,
      imported,
      message: `Lista "${listName}" creada (ID: ${listId}). ${imported} contactos importados.`,
    });

  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    return Response.json({ error: "Error interno del servidor", details: message }, { status: 500 });
  }
}
