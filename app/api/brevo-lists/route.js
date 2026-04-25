// app/api/brevo-lists/route.js
// Obtiene listas de Brevo — primero desde Supabase, luego desde Brevo API

import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export async function GET() {
  try {
    // ── 1. Intentar desde Supabase primero ───────────────────────────────────
    const supabase = getSupabase();
    const { data: localLists, error } = await supabase
      .from("brevo_lists")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && localLists && localLists.length > 0) {
      return Response.json({
        success: true,
        lists: localLists.map(l => ({
          id: l.id,
          name: l.name,
          uniqueSubscribers: l.unique_subscribers,
        })),
        source: "supabase",
      });
    }

    // ── 2. Fallback: consultar Brevo API directamente ────────────────────────
    const API_KEY = process.env.BREVO_API_KEY;
    if (!API_KEY) {
      return Response.json({ error: "BREVO_API_KEY no configurada" }, { status: 500 });
    }

    const res = await fetch("https://api.brevo.com/v3/contacts/lists?limit=50&offset=0", {
      headers: {
        "api-key": API_KEY,
        "Accept": "application/json",
      },
    });

    const data = await res.json();

    if (!res.ok) {
      return Response.json({ error: data.message || "Error al obtener listas" }, { status: res.status });
    }

    // Guardar en Supabase para la próxima vez
    if (data.lists && data.lists.length > 0) {
      await supabase.from("brevo_lists").upsert(
        data.lists.map(l => ({
          id: l.id,
          name: l.name,
          unique_subscribers: l.uniqueSubscribers || 0,
        }))
      );
    }

    return Response.json({
      success: true,
      lists: data.lists || [],
      source: "brevo",
    });

  } catch (err) {
    const message = err && err.message ? err.message : "Error desconocido";
    return Response.json({ error: "Error interno", details: message }, { status: 500 });
  }
}
