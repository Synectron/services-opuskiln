import { useMemo, useState } from "react";
import { useCatalog } from "../data/catalog.tsx";
import { CATEGORIES, activePortion, itemDesc, itemName, otherPortionLine, portionName, unitPrice, type CategoryId } from "../data/menu.ts";
import { inr } from "../lib/order.ts";
import { useStore } from "../store.tsx";
import { SearchIcon, VegMark } from "./Icons.tsx";

type Filter = "all" | CategoryId;

export function MenuSection() {
  const { t, lang, size, setSize, add } = useStore();
  const { menu } = useCatalog();
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    return menu.filter((item) => {
      if (filter !== "all" && item.category !== filter) return false;
      if (!q) return true;
      return `${item.name} ${item.nameHi} ${item.desc} ${item.descHi}`.toLowerCase().includes(q);
    });
  }, [filter, query, menu]);

  const chips: { id: Filter; label: string; count: number }[] = [
    { id: "all", label: t.all, count: menu.length },
    ...CATEGORIES.map((category) => ({
      id: category.id,
      label: lang === "hi" ? category.hi : category.en,
      count: menu.filter((item) => item.category === category.id).length,
    })),
  ];

  return (
    <section id="menu" className="scroll-mt-28 mx-auto max-w-6xl px-4 pb-16 md:px-6">
      <div className="rounded-[1.75rem] bg-[#fffaf3]/80 px-4 py-6 ring-1 ring-ink/10 sm:px-6 sm:py-8">
        <p className="text-xs font-semibold tracking-[0.2em] text-[#8a5a16] uppercase">{t.menuKicker}</p>
        <h2 className="mt-2 max-w-xl font-display text-4xl leading-none font-semibold text-ink sm:text-5xl">{t.menuTitle}</h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#4e4036] sm:text-base">{t.menuLead}</p>

        <div className="mt-6 grid gap-3">
          <label className="relative block">
            <span className="sr-only">{t.searchLabel}</span>
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-[#6e5b4c]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t.searchPlaceholder}
              className="h-12 w-full rounded-2xl bg-white pr-12 pl-11 text-base text-ink ring-1 ring-[#e4d5c0] outline-none placeholder:text-[#8a7768] focus-visible:ring-2 focus-visible:ring-maroon"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute top-1/2 right-2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-lg text-[#6e5b4c]"
                aria-label={t.clearSearch}
              >
                ×
              </button>
            )}
          </label>

          <div role="group" aria-label={t.categoriesLabel} className="flex gap-2 overflow-x-auto pb-1">
            {chips.map((chip) => (
              <button
                key={chip.id}
                type="button"
                aria-pressed={filter === chip.id}
                onClick={() => setFilter(chip.id)}
                className={`min-h-11 shrink-0 rounded-full px-3.5 text-sm font-semibold transition-colors ${
                  filter === chip.id ? "bg-maroon text-[#fffaf3]" : "bg-white text-ink ring-1 ring-[#e4d5c0]"
                }`}
              >
                {chip.label}
                <span className={filter === chip.id ? "text-[#f0d59a]" : "text-[#8a7768]"}> {chip.count}</span>
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div role="group" aria-label={t.portionLabel} className="grid w-full grid-cols-2 rounded-full bg-ink/5 p-1 sm:w-56">
              {(["half", "full"] as const).map((choice) => (
                <button
                  key={choice}
                  type="button"
                  aria-pressed={size === choice}
                  onClick={() => setSize(choice)}
                  className={`min-h-11 rounded-full text-sm font-semibold transition-colors ${
                    size === choice ? "bg-maroon text-[#fffaf3]" : "text-ink"
                  }`}
                >
                  {choice === "half" ? t.half : t.full}
                </button>
              ))}
            </div>
            <p className="text-xs leading-relaxed text-[#6e5b4c] sm:max-w-sm sm:text-right">{t.portionHint}</p>
          </div>
        </div>

        {items.length === 0 ? (
          <p className="mt-8 rounded-2xl bg-white px-4 py-8 text-center text-sm text-[#4e4036]">{t.noResults}</p>
        ) : (
          <ul className="mt-4 grid md:grid-cols-2 md:gap-x-10">
            {items.map((item) => {
              const portion = activePortion(item, size);
              const price = unitPrice(item, portion);
              const other = otherPortionLine(item, size, lang);
              return (
                <li key={item.id} className="border-b border-[#eadfce] py-4">
                  <div className="flex items-start gap-2">
                    <VegMark label={t.pureVeg} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <h3 className="font-semibold text-ink">{itemName(item, lang)}</h3>
                        {item.bestseller && (
                          <span className="rounded-full bg-[#e36a12]/12 px-2 py-0.5 text-[10px] font-bold tracking-wider text-[#b45309] uppercase">
                            {t.bestseller}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm leading-snug text-[#6e5b4c]">{itemDesc(item, lang)}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-end justify-between gap-3 pl-6">
                    <div>
                      <p className="text-[11px] font-semibold tracking-wide text-maroon uppercase">
                        {portionName(item, portion, lang)}
                      </p>
                      <p className="text-xl font-semibold tabular-nums text-ink">{inr(price)}</p>
                      {other && <p className="text-xs text-[#8a7768]">{other}</p>}
                    </div>
                    <button
                      type="button"
                      onClick={() => add(item.id)}
                      className="min-h-11 rounded-full bg-ink px-4 text-sm font-semibold text-[#fffaf3] transition active:scale-95"
                      aria-label={`${t.add} ${itemName(item, lang)}, ${portionName(item, portion, lang)}, ${inr(price)}`}
                    >
                      {t.add}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
