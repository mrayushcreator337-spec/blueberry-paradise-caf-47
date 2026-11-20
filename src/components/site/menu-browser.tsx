import { Plus, Search } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Category, MenuItem } from "@/lib/catalog";
import { priceLabel } from "@/lib/catalog";
import { useCart } from "./cart";
import { optimizedImage } from "@/lib/images";
import { UtensilsCrossed } from "lucide-react";
// No owner photo yet → neutral branded placeholder; never substitute a stand-in food photo.
export function DishImage({ url, name }: { url: string | null; name: string }) {
  const src = url ? optimizedImage(url, 600) : "";
  const [failed, setFailed] = useState(false);
  if (src && !failed)
    return (
      <img
        src={src}
        alt={name}
        width={600}
        height={450}
        className="mb-4 aspect-[4/3] w-full rounded-md object-cover"
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
      />
    );
  return (
    <div
      data-testid="dish-placeholder"
      role="img"
      aria-label={`Photo coming soon: ${name}`}
      className="mb-4 flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed bg-secondary/60 text-muted-foreground"
    >
      <UtensilsCrossed aria-hidden className="size-7 opacity-60" />
      <span className="text-xs uppercase tracking-widest">Photo coming soon</span>
    </div>
  );
}
export function MenuBrowser({
  categories,
  items,
  search,
  category,
  onSearch,
  onCategory,
}: {
  categories: Category[];
  items: MenuItem[];
  search: string;
  category: string;
  onSearch: (v: string) => void;
  onCategory: (v: string) => void;
}) {
  const cart = useCart();
  const [variants, setVariants] = useState<Record<string, number>>({});
  const shown = items.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()));
  return (
    <>
      <div className="my-8 flex flex-col gap-4 md:flex-row">
        <label className="relative flex-1">
          <Search className="absolute left-4 top-3.5 size-5 text-muted-foreground" />
          <input
            aria-label="Search menu"
            className="field pl-12"
            placeholder="Find your craving…"
            maxLength={100}
            value={search}
            onChange={(e) => onSearch(e.target.value)}
          />
        </label>
        <select
          aria-label="Menu category"
          className="field md:w-64"
          value={category}
          onChange={(e) => onCategory(e.target.value)}
        >
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-8 flex gap-2 overflow-x-auto pb-3">
        <Button
          variant={category === "all" ? "berry" : "outline"}
          size="pill"
          onClick={() => onCategory("all")}
        >
          All
        </Button>
        {categories.map((c) => (
          <Button
            key={c.slug}
            variant={category === c.slug ? "berry" : "outline"}
            size="pill"
            onClick={() => onCategory(c.slug)}
          >
            {c.name}
          </Button>
        ))}
      </div>
      {categories
        .filter((c) => category === "all" || c.slug === category)
        .map((c) => {
          const list = shown.filter((i) => i.category_id === c.id);
          if (!list.length) return null;
          return (
            <section className="mb-12" key={c.id}>
              <div className="mb-5 flex items-baseline justify-between border-b pb-3">
                <h2 className="text-2xl md:text-3xl">{c.name}</h2>
                <span className="text-sm text-muted-foreground">{list.length} items</span>
              </div>
              {c.description && <p className="mb-4 text-muted-foreground">{c.description}</p>}
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {list.map((item) => {
                  const variant = variants[item.id] ?? 0;
                  const quoted = c.slug === "pasta";
                  const price = quoted ? null : (item.prices[variant] ?? null);
                  const label =
                    item.name === "Shape Cake / Semi Fondant"
                      ? "1 kg"
                      : (c.price_labels[variant] ?? "");
                  return (
                    <article key={item.id} className="flex flex-col rounded-lg border bg-card p-5">
                      <DishImage url={item.image_url} name={item.name} />
                      <h3 className="font-display text-xl">{item.name}</h3>
                      {item.description && (
                        <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                      )}
                      <p className="mt-3 text-sm font-semibold text-berry">{priceLabel(item, c)}</p>
                      <div className="mt-auto flex items-center justify-between gap-3 pt-5">
                        {item.prices.length > 1 ? (
                          <select
                            aria-label={`Size for ${item.name}`}
                            className="field w-auto py-2 text-sm"
                            value={variant}
                            onChange={(e) =>
                              setVariants({ ...variants, [item.id]: Number(e.target.value) })
                            }
                          >
                            {item.prices.map((_, i) => (
                              <option key={i} value={i}>
                                {c.price_labels[i] ?? `Option ${i + 1}`}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            {quoted ? "Variety & price to confirm" : label}
                          </span>
                        )}
                        <Button
                          aria-label={`Add ${item.name}`}
                          variant="outline"
                          onClick={() => cart.add(item, label, price)}
                        >
                          <Plus />
                          {price === null ? "Request" : "Add"}
                        </Button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          );
        })}
      {!shown.some((i) =>
        categories.some(
          (c) => c.id === i.category_id && (category === "all" || c.slug === category),
        ),
      ) && (
        <p className="py-12 text-center text-muted-foreground">
          No matches. Try another dish or category.
        </p>
      )}
    </>
  );
}
