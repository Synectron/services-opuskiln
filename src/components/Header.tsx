import { useEffect, useState } from "react";
import { SITE } from "../data/site.ts";
import { useStore } from "../store.tsx";
import { CartIcon, LogoMark } from "./Icons.tsx";

const LINKS = [
  ["menu", "menu"],
  ["story", "story"],
  ["reviews", "reviews"],
  ["visit", "visit"],
] as const;

export function Header() {
  const { t, lang, setLang, count, setCartOpen } = useStore();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const linkClass =
    "rounded-full px-3 py-2 text-sm font-semibold text-ink/80 transition hover:bg-white hover:text-ink";

  return (
    <header
      id="top"
      className={`sticky top-0 z-40 border-b backdrop-blur-md transition ${
        scrolled ? "border-ink/10 bg-[#f6efe4]/92 shadow-[0_10px_30px_rgba(36,23,15,0.06)]" : "border-transparent bg-[#f6efe4]/80"
      }`}
    >
      <a href="#menu" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:z-50 focus:rounded-full focus:bg-maroon focus:px-3 focus:py-2 focus:text-white">
        {t.skip}
      </a>
      <div className="mx-auto flex max-w-6xl items-center gap-2.5 px-4 py-2.5 md:px-6">
        <a href="#top" className="flex min-w-0 items-center gap-2.5">
          <LogoMark />
          <span className="min-w-0">
            <span className="block font-display text-[1.35rem] leading-none font-semibold text-maroon">RKN</span>
            <span className="block truncate text-[11px] font-medium tracking-wide text-[#6e5b4c] uppercase">
              {SITE.name.replace("RKN ", "")}
            </span>
          </span>
        </a>
        <nav className="ml-6 hidden items-center gap-1 md:flex" aria-label="Sections">
          {LINKS.map(([key, id]) => (
            <a key={id} href={`#${id}`} className={linkClass}>
              {t.nav[key]}
            </a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <div role="group" aria-label={t.langLabel} className="flex rounded-full bg-ink/5 p-1">
            <button
              type="button"
              aria-pressed={lang === "en"}
              onClick={() => setLang("en")}
              className={`min-h-9 min-w-10 rounded-full px-2 text-sm font-semibold ${lang === "en" ? "bg-white text-ink shadow-sm" : "text-[#6e5b4c]"}`}
            >
              {t.langEn}
            </button>
            <button
              type="button"
              aria-pressed={lang === "hi"}
              onClick={() => setLang("hi")}
              className={`min-h-9 min-w-10 rounded-full px-2 text-sm font-semibold ${lang === "hi" ? "bg-white text-ink shadow-sm" : "text-[#6e5b4c]"}`}
            >
              {t.langHi}
            </button>
          </div>
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            aria-label={`${t.openCart}, ${t.items(count)}`}
            className="relative grid size-11 place-items-center rounded-full bg-maroon text-[#fffaf3]"
          >
            <CartIcon />
            {count > 0 && (
              <span key={count} className="cart-pop absolute -top-1 -right-1 grid min-w-5 place-items-center rounded-full bg-[#e6c27a] px-1 text-[11px] font-bold text-ink">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>
      <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-2.5 md:hidden" aria-label="Sections">
        {LINKS.map(([key, id]) => (
          <a key={id} href={`#${id}`} className="shrink-0 rounded-full px-3 py-1.5 text-sm font-semibold text-ink/80">
            {t.nav[key]}
          </a>
        ))}
      </nav>
    </header>
  );
}
