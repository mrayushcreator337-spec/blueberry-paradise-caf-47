import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { loadPublicContent } from "@/lib/content.server";
import { priceLabel, type Category, type MenuItem } from "@/lib/catalog";
import { DishImage } from "@/components/site/menu-browser";

const cat: Category = {
  id: "c1",
  slug: "pizza",
  name: "Pizza",
  description: null,
  price_labels: ["8 inch", "10 inch"],
  sort_order: 0,
  is_active: true,
};
const dbRows: Record<string, unknown[]> = {
  menu_categories: [cat],
  menu_items: [
    {
      id: "i1",
      category_id: "c1",
      name: "Farm House",
      description: null,
      prices: ["180"],
      is_available: true,
      is_featured: false,
      image_url: null,
      sort_order: 0,
    },
  ],
  gallery_images: [],
  site_settings: [],
};
const okFetch = vi.fn(async (input: RequestInfo | URL) => {
  const table = new URL(String(input)).pathname.split("/").pop()!;
  return new Response(JSON.stringify(dbRows[table] ?? []), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}) as unknown as typeof fetch;
vi.spyOn(console, "error").mockImplementation(() => {});

describe("public menu content", () => {
  it("serves database rows (not the reference menu) when the Cloud database answers", async () => {
    const r = await loadPublicContent(
      { url: "https://db.example.co", key: "sb_publishable_test" },
      okFetch,
    );
    expect(r.source).toBe("database");
    expect(r.fallback).toBe(false);
    expect(r.items[0]?.name).toBe("Farm House");
    expect(r.items[0]?.prices).toEqual([180]);
  });

  it("keeps an intentionally empty live menu empty instead of swapping in the reference menu", async () => {
    const empty = vi.fn(
      async () =>
        new Response("[]", { status: 200, headers: { "content-type": "application/json" } }),
    ) as unknown as typeof fetch;
    const r = await loadPublicContent(
      { url: "https://db.example.co", key: "sb_publishable_test" },
      empty,
    );
    expect(r.source).toBe("database");
    expect(r.items).toHaveLength(0);
  });

  it("falls back to the reference menu only when the database fails, and says why", async () => {
    const failing = vi.fn(
      async () =>
        new Response(JSON.stringify({ message: "boom" }), {
          status: 500,
          headers: { "content-type": "application/json" },
        }),
    ) as unknown as typeof fetch;
    const r = await loadPublicContent(
      { url: "https://db.example.co", key: "sb_publishable_test" },
      failing,
    );
    expect(r.source).toBe("reference");
    expect(r.reason).toBe("query-error");
    const missing = await loadPublicContent({ url: undefined, key: undefined });
    expect(missing.reason).toBe("missing-binding");
  });

  it('shows "Ask for price" for items without a price', () => {
    const item: MenuItem = {
      id: "x",
      category_id: "c1",
      name: "Hot Coffee",
      description: null,
      prices: [],
      is_available: true,
      image_url: null,
      sort_order: 0,
      is_featured: false,
    };
    expect(priceLabel(item, cat)).toBe("Ask for price");
  });

  it("renders a placeholder, not a photo, when an item has no image", () => {
    render(<DishImage url={null} name="Farm House" />);
    expect(screen.getByTestId("dish-placeholder")).toBeTruthy();
    expect(screen.queryByRole("img", { name: "Farm House" })).toBeNull();
  });
});
