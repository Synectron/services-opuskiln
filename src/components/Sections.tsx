import { SITE, directionsHref, mapEmbedSrc } from "../data/site.ts";
import { useStore } from "../store.tsx";
import { ChatIcon, PhoneIcon, PinIcon, VegMark } from "./Icons.tsx";
import { whatsAppUrl } from "../lib/order.ts";

export function Story() {
  const { t } = useStore();
  return (
    <section id="story" className="scroll-mt-28 mx-auto max-w-6xl px-4 pb-16 md:px-6">
      <div className="reveal grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-[#8a5a16] uppercase">{t.storyKicker}</p>
          <h2 className="mt-2 font-display text-4xl leading-[0.95] font-semibold text-ink sm:text-5xl">{t.storyTitle}</h2>
          <p className="mt-3 text-base leading-relaxed text-[#4e4036]">{t.storyLead}</p>
          <p className="mt-4 inline-flex items-center gap-2 text-lg font-semibold text-veg">
            <VegMark label={t.pureVeg} />
            {t.pull}
          </p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {t.reasons.map((reason) => (
              <li key={reason.title} className="rounded-3xl bg-white/75 p-4 ring-1 ring-ink/10">
                <h3 className="font-semibold text-ink">{reason.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-[#4e4036]">{reason.body}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <figure>
            <img
              src="/photos/momos.webp"
              width={800}
              height={1000}
              alt={t.momoAlt}
              loading="lazy"
              decoding="async"
              className="aspect-[4/5] w-full rounded-[1.4rem] object-cover"
            />
            <figcaption className="mt-2 text-center text-xs font-medium text-[#6e5b4c]">{t.momoCap}</figcaption>
          </figure>
          <figure className="pt-8">
            <img
              src="/photos/rolls.webp"
              width={800}
              height={1000}
              alt={t.rollAlt}
              loading="lazy"
              decoding="async"
              className="aspect-[4/5] w-full rounded-[1.4rem] object-cover"
            />
            <figcaption className="mt-2 text-center text-xs font-medium text-[#6e5b4c]">{t.rollCap}</figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}

export function Reviews() {
  const { t } = useStore();
  return (
    <section id="reviews" className="scroll-mt-28 mx-auto max-w-6xl px-4 pb-16 md:px-6">
      <div className="reveal">
        <p className="text-xs font-semibold tracking-[0.2em] text-[#8a5a16] uppercase">{t.reviewsKicker}</p>
        <h2 className="mt-2 max-w-xl font-display text-4xl leading-none font-semibold text-ink sm:text-5xl">{t.reviewsTitle}</h2>
        <p className="mt-4 max-w-2xl rounded-2xl border border-dashed border-[#c4923a] bg-[#e6c27a]/25 px-4 py-3 text-sm leading-relaxed text-ink">
          <strong className="font-semibold">{t.sample}.</strong> {t.reviewsNote}
        </p>
        <ul className="mt-5 flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory md:grid md:grid-cols-3 md:overflow-visible">
          {t.quotes.map((quote) => (
            <li key={quote.quote} className="flex min-w-[84%] snap-start flex-col rounded-[1.4rem] bg-white/80 p-5 ring-1 ring-ink/10 md:min-w-0">
              <span className="w-fit rounded-full bg-maroon px-2 py-0.5 text-[10px] font-bold tracking-wider text-[#fffaf3] uppercase">
                {t.sample}
              </span>
              <blockquote className="mt-3 flex-1 text-base leading-relaxed text-ink">“{quote.quote}”</blockquote>
              <p className="mt-4 text-sm font-semibold text-[#6e5b4c]">
                {quote.name}
                <span className="font-medium"> · {quote.place}</span>
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Visit() {
  const { t, lang } = useStore();
  const lines = lang === "hi" ? SITE.addressLinesHi : SITE.addressLines;
  return (
    <section id="visit" className="scroll-mt-28 mx-auto max-w-6xl px-4 pb-16 md:px-6">
      <div className="reveal grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-stretch">
        <div className="rounded-[1.75rem] bg-maroon px-5 py-6 text-[#fffaf3]">
          <p className="text-xs font-semibold tracking-[0.2em] text-[#e6c27a] uppercase">{t.visitKicker}</p>
          <h2 className="mt-2 font-display text-4xl leading-none font-semibold">{t.visitTitle}</h2>
          <address className="mt-4 text-sm leading-relaxed not-italic">
            {lines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </address>
          <p className="mt-3 text-sm text-[#f0d59a]">{t.hours}</p>
          <p className="mt-1 text-sm">{t.propLine}</p>
          <div className="mt-5 flex flex-col gap-2">
            <a className="btn bg-white text-maroon" href={`tel:${SITE.phoneTel}`}>
              <PhoneIcon />
              {t.callNow} · {SITE.phoneDisplay}
            </a>
            <a className="btn bg-veg text-white" href={whatsAppUrl(t.hello)} target="_blank" rel="noreferrer">
              <ChatIcon />
              {t.whatsapp}
            </a>
            <a className="btn border border-[#e6c27a] text-[#fffaf3]" href={directionsHref} target="_blank" rel="noreferrer">
              <PinIcon />
              {t.directions}
            </a>
          </div>
        </div>
        <div className="overflow-hidden rounded-[1.75rem] bg-white ring-1 ring-ink/10">
          <iframe
            title={t.mapTitle}
            src={mapEmbedSrc}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-72 w-full border-0 md:h-full md:min-h-[420px]"
          />
          <p className="px-4 py-3 text-xs leading-relaxed text-[#6e5b4c]">{t.mapFallback}</p>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  const { t } = useStore();
  return (
    <footer className="border-t border-ink/10 px-4 py-8 pb-28 md:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-3">
        <p className="font-display text-2xl font-semibold text-maroon">RKN</p>
        <p className="text-sm font-semibold">{SITE.name}</p>
        <p className="text-sm text-[#4e4036]">{t.footerNote}</p>
        <p className="text-sm text-[#4e4036]">
          <a className="underline" href={`tel:${SITE.phoneTel}`}>
            {SITE.phoneDisplay}
          </a>
          {" · "}
          {t.propLine}
        </p>
        <p className="max-w-3xl text-xs leading-relaxed text-[#6e5b4c]">
          {t.photoCredit}{" "}
          <a className="underline" href="https://commons.wikimedia.org/wiki/File:Paneer_Tikka_Kabab.JPG">
            Paneer tikka
          </a>
          {" · "}
          <a className="underline" href="https://commons.wikimedia.org/wiki/File:Veg_Momo_1.jpg">
            Momos
          </a>
          {" · "}
          <a className="underline" href="https://commons.wikimedia.org/wiki/File:Spring_roll_001.jpg">
            Spring rolls
          </a>
          {" · "}
          <a className="underline" href="https://creativecommons.org/licenses/by-sa/4.0/">
            CC BY-SA 4.0
          </a>
        </p>
      </div>
    </footer>
  );
}
