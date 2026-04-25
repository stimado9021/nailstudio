// app/api/import-contacts/route.js
// Guarda contactos en Supabase + crea lista en Brevo + importa contactos

import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export async function POST(request) {
  try {
    const { listName, contacts } = await request.json();
    const API_KEY = process.env.BREVO_API_KEY;

    if (!API_KEY) {
      return Response.json({ error: "BREVO_API_KEY no configurada" }, { status: 500 });
    }
    if (!listName || !contacts || contacts.length === 0) {
      return Response.json({ error: "Nombre de lista y contactos son requeridos" }, { status: 400 });
    }

    const supabase = getSupabase();

    // ── 1. Guardar contactos en Supabase ─────────────────────────────────────
    const contactsToInsert = contacts.map(c => ({
      name:      c.name,
      email:     c.email,
      list_name: listName,
      status:    "local",
    }));

    const { error: insertError } = await supabase
      .from("contacts")
      .insert(contactsToInsert);

    if (insertError) {
      console.error("Supabase insert error:", insertError.message);
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
        error: "Error creando lista en Brevo: " + (listData.message || "Error desconocido"),
      }, { status: listRes.status });
    }

    const listId = listData.id;

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
          jsonBody: batch.map(c => ({
            email: c.email,
            attributes: {
              FIRSTNAME: c.name ? c.name.split(" ")[0] : "",
              LASTNAME:  c.name ? c.name.split(" ").slice(1).join(" ") : "",
            },
          })),
        }),
      });

      if (importRes.ok) imported += batch.length;
    }

    // ── 4. Actualizar estado en Supabase ─────────────────────────────────────
    await supabase
      .from("contacts")
      .update({ status: "synced", brevo_list_id: listId })
      .eq("list_name", listName);

    // ── 5. Guardar lista en Supabase ──────────────────────────────────────────
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
    const message = err && err.message ? err.message : "Error desconocido";
    return Response.json({ error: "Error interno del servidor", details: message }, { status: 500 });
  }
}
