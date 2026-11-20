import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { fallbackCategories, fallbackItems } from "./catalog";

type Fetch = typeof fetch;

// Publishable keys (sb_publishable_…) are opaque, not JWTs: send them only as `apikey`.
export function publicDbClient(url: string, key: string, baseFetch: Fetch = fetch) {
  return createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return baseFetch(input, { ...init, headers: h });
      },
    },
  });
}

export type ContentSource = "database" | "reference";

export function referenceContent(reason: string) {
  return {
    categories: fallbackCategories,
    items: fallbackItems,
    gallery: [] as Database["public"]["Tables"]["gallery_images"]["Row"][],
    settings: [] as Database["public"]["Tables"]["site_settings"]["Row"][],
    fallback: true as boolean,
    source: "reference" as ContentSource,
    reason,
  };
}

/** Reads active public content from the project's Cloud database; falls back only on service failure. */
export async function loadPublicContent(
  env: { url?: string | undefined; key?: string | undefined },
  baseFetch: Fetch = fetch,
) {
  if (!env.url || !env.key) {
    console.error(
      "[content] Server database binding missing (SUPABASE_URL / SUPABASE_PUBLISHABLE_KEY); serving reference menu.",
    );
    return referenceContent("missing-binding");
  }
  try {
    const db = publicDbClient(env.url, env.key, baseFetch);
    const [c, i, g, s] = await Promise.all([
      db
        .from("menu_categories")
        .select("id,slug,name,description,price_labels,sort_order,is_active,created_at")
        .eq("is_active", true)
        .order("sort_order"),
      db
        .from("menu_items")
        .select(
          "id,category_id,name,description,prices,is_available,is_featured,image_url,sort_order,created_at",
        )
        .eq("is_available", true)
        .order("sort_order"),
      db
        .from("gallery_images")
        .select("id,url,alt,caption,sort_order,is_active,created_at")
        .eq("is_active", true)
        .order("sort_order"),
      db.from("site_settings").select("key,value,updated_at"),
    ]);
    const err = c.error ?? i.error ?? g.error ?? s.error;
    if (err) {
      console.error("[content] Database read failed; serving reference menu:", err.message);
      return referenceContent("query-error");
    }
    return {
      categories: c.data ?? [],
      items: (i.data ?? []).map((x) => ({ ...x, prices: (x.prices ?? []).map(Number) })),
      gallery: g.data ?? [],
      settings: s.data ?? [],
      fallback: false as boolean,
      source: "database" as ContentSource,
      reason: null as string | null,
    };
  } catch (e) {
    console.error(
      "[content] Database unreachable; serving reference menu:",
      e instanceof Error ? e.message : e,
    );
    return referenceContent("unreachable");
  }
}
