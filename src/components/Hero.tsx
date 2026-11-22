import { useCatalog } from "../data/catalog.tsx";
import { whatsAppUrl } from "../lib/order.ts";
import { useStore } from "../store.tsx";
import { ChatIcon, PhoneIcon, VegMark } from "./Icons.tsx";

export function Hero() {
  const { t, count, setCartOpen } = useStore();
  const { site } = useCatalog();

  return (
    <section className="mx-auto grid max-w-6xl items-center gap-8 px-4 pt-4 pb-12 md:px-6 md:pt-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:py-16">
      <div>
        <p className="text-xs font-semibold tracking-[0.22em] text-[#8a5a16] uppercase">
          {t.eyebrow}
        </p>
        <div className="mt-3 inline-flex max-w-full flex-wrap items-center gap-x-2 gap-y-1 rounded-full bg-white/80 py-1.5 pr-3 pl-2 text-sm font-semibold text-veg ring-1 ring-veg/25">
          <VegMark label={t.pureVeg} />
          <span>100% शुद्ध शाकाहारी</span>
          <span className="text-[#6e5b4c]" aria-hidden="true">
            |
          </span>
          <span>100% Pure Veg</span>
        </div>
        <h1 className="mt-4 font-display text-[5.1rem] leading-[0.8] font-semibold text-maroon sm:text-[6.4rem]">
          RKN
        </h1>
        <p className="mt-2 max-w-xl text-[1.65rem] leading-tight font-semibold tracking-tight text-ink sm:text-4xl">
          {t.nameLine}
        </p>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-[#4e4036] sm:text-lg">
          {t.heroBody}
        </p>
        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
          {count > 0 ? (
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="btn btn-wa"
            >
              <ChatIcon className="size-5" />
              {t.orderWa}
            </button>
          ) : (
            <a
              className="btn btn-wa"
              href={whatsAppUrl(t.hello)}
              target="_blank"
              rel="noreferrer"
            >
              <ChatIcon className="size-5" />
              {t.orderWa}
            </a>
          )}
          <a className="btn btn-call" href={`tel:${site.phoneTel}`}>
            <PhoneIcon className="size-5" />
            {t.call} · {site.phoneDisplay}
          </a>
        </div>
        <div className="mt-2.5 grid grid-cols-2 gap-2.5 sm:flex sm:flex-wrap">
          <a
            className="btn btn-zomato"
            href={site.zomato}
            target="_blank"
            rel="noreferrer"
          >
            Zomato
          </a>
          <a
            className="btn btn-swiggy"
            href={site.swiggy}
            target="_blank"
            rel="noreferrer"
          >
            Swiggy
          </a>
          {site.magicpin ? (
            <a
              className="btn btn-magicpin col-span-2 sm:col-span-1"
              href={site.magicpin}
              target="_blank"
              rel="noreferrer"
            >
              magicpin
            </a>
          ) : null}
        </div>
        <p className="mt-4 text-sm text-[#6e5b4c]">
          {t.propLine} · {t.hours}
        </p>
      </div>

      <div className="relative mx-auto w-full max-w-xl">
        <div
          className="pointer-events-none absolute -inset-2 rounded-[2rem] border border-[#e6c27a]/90"
          aria-hidden="true"
        />
        <div className="relative aspect-[3/2] overflow-hidden rounded-[1.6rem] bg-[#2a1812] shadow-[0_24px_50px_rgba(36,23,15,0.18)]">
          <img
            src="/photos/tandoor-800.webp"
            srcSet="/photos/tandoor-800.webp 800w, /photos/tandoor-1400.webp 1400w"
            sizes="(min-width: 1024px) 520px, (min-width: 768px) 46vw, calc(100vw - 2rem)"
            width={1400}
            height={933}
            alt={t.heroAlt}
            fetchPriority="high"
            decoding="async"
            className="h-full w-full object-cover"
          />
        </div>
        <p className="stamp absolute top-4 left-4">{t.readyStamp}</p>
        <p className="absolute right-4 bottom-4 left-4 rounded-2xl bg-[#fffaf3]/92 px-3 py-2 text-sm font-semibold text-ink shadow-sm backdrop-blur-sm">
          {t.photoChip}
          <span className="mt-0.5 block text-xs font-medium text-[#6e5b4c]">
            Free home delivery on ₹{site.freeDelivery}+
          </span>
        </p>
      </div>
    </section>
  );
}
