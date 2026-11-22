import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useCatalog } from "../data/catalog.tsx";
import { CACHED_GOOGLE_REVIEWS, type ReviewsPayload } from "../data/reviews.ts";
import { directionsHrefFor, mapEmbedSrcFor } from "../data/site.ts";
import { fetchPublicReviews } from "../lib/api.ts";
import { whatsAppUrl } from "../lib/order.ts";
import { useStore } from "../store.tsx";
import { ChatIcon, PhoneIcon, PinIcon, VegMark } from "./Icons.tsx";

export function Story() {
  const { t } = useStore();
  return (
    <section
      id="story"
      className="scroll-mt-28 mx-auto max-w-6xl px-4 pb-16 md:px-6"
    >
      <div className="reveal grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-[#8a5a16] uppercase">
            {t.storyKicker}
          </p>
          <h2 className="mt-2 font-display text-4xl leading-[0.95] font-semibold text-ink sm:text-5xl">
            {t.storyTitle}
          </h2>
          <p className="mt-3 text-base leading-relaxed text-[#4e4036]">
            {t.storyLead}
          </p>
          <p className="mt-4 inline-flex items-center gap-2 text-lg font-semibold text-veg">
            <VegMark label={t.pureVeg} />
            {t.pull}
          </p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {t.reasons.map((reason) => (
              <li
                key={reason.title}
                className="rounded-3xl bg-white/75 p-4 ring-1 ring-ink/10"
              >
                <h3 className="font-semibold text-ink">{reason.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-[#4e4036]">
                  {reason.body}
                </p>
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
            <figcaption className="mt-2 text-center text-xs font-medium text-[#6e5b4c]">
              {t.momoCap}
            </figcaption>
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
            <figcaption className="mt-2 text-center text-xs font-medium text-[#6e5b4c]">
              {t.rollCap}
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}

function Stars({ rating }: { rating: number }) {
  const filled = Math.max(0, Math.min(5, Math.round(rating)));
  return (
    <span
      className="inline-flex items-center gap-0.5 text-[#c4923a]"
      aria-label={`${rating} out of 5`}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} aria-hidden="true">
          {i < filled ? "★" : "☆"}
        </span>
      ))}
    </span>
  );
}

export function Reviews() {
  const { t } = useStore();
  const [data, setData] = useState<ReviewsPayload>(CACHED_GOOGLE_REVIEWS);

  useEffect(() => {
    let alive = true;
    void fetchPublicReviews()
      .then((payload) => {
        if (alive && payload?.reviews?.length) setData(payload);
      })
      .catch(() => {
        /* keep cached Google reviews */
      });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <section
      id="reviews"
      className="scroll-mt-28 mx-auto max-w-6xl px-4 pb-16 md:px-6"
    >
      <div className="reveal">
        <p className="text-xs font-semibold tracking-[0.2em] text-[#8a5a16] uppercase">
          {t.reviewsKicker}
        </p>
        <h2 className="mt-2 max-w-xl font-display text-4xl leading-none font-semibold text-ink sm:text-5xl">
          {t.reviewsTitle}
        </h2>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-[#4e4036]">
          <Stars rating={data.rating} />
          <p className="font-semibold text-ink">
            {t.reviewsRating(data.rating.toFixed(1), data.count)}
          </p>
          <a
            className="font-semibold text-maroon underline underline-offset-2"
            href={data.mapsUrl}
            target="_blank"
            rel="noreferrer"
          >
            {t.reviewsOnGoogle}
          </a>
        </div>
        {data.reviews.length === 0 ? (
          <p className="mt-5 text-sm text-[#6e5b4c]">{t.reviewsEmpty}</p>
        ) : (
          <ul className="mt-5 flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory md:grid md:grid-cols-3 md:overflow-visible">
            {data.reviews.map((review) => (
              <li
                key={`${review.author}-${review.text.slice(0, 24)}`}
                className="flex min-w-[84%] snap-start flex-col rounded-[1.4rem] bg-white/80 p-5 ring-1 ring-ink/10 md:min-w-0"
              >
                <Stars rating={review.rating} />
                <blockquote className="mt-3 flex-1 text-base leading-relaxed text-ink">
                  “{review.text}”
                </blockquote>
                <p className="mt-4 text-sm font-semibold text-[#6e5b4c]">
                  {review.author}
                  {review.relativeTime ? (
                    <span className="font-medium">
                      {" "}
                      · {review.relativeTime}
                    </span>
                  ) : null}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

export function Visit() {
  const { t, lang } = useStore();
  const { site } = useCatalog();
  const lines = lang === "hi" ? site.addressLinesHi : site.addressLines;
  const hours = lang === "hi" ? site.hoursHi : site.hoursEn;
  return (
    <section
      id="visit"
      className="scroll-mt-28 mx-auto max-w-6xl px-4 pb-16 md:px-6"
    >
      <div className="reveal grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-stretch">
        <div className="rounded-[1.75rem] bg-maroon px-5 py-6 text-[#fffaf3]">
          <p className="text-xs font-semibold tracking-[0.2em] text-[#e6c27a] uppercase">
            {t.visitKicker}
          </p>
          <h2 className="mt-2 font-display text-4xl leading-none font-semibold">
            {t.visitTitle}
          </h2>
          <address className="mt-4 text-sm leading-relaxed not-italic">
            {lines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </address>
          <p className="mt-3 text-sm text-[#f0d59a]">{hours}</p>
          <p className="mt-1 text-sm">
            {lang === "hi"
              ? `प्रोप. ${site.proprietor}`
              : `Prop. ${site.proprietor}`}
          </p>
          <div className="mt-5 flex flex-col gap-2">
            <a
              className="btn bg-white text-maroon"
              href={`tel:${site.phoneTel}`}
            >
              <PhoneIcon />
              {t.callNow} · {site.phoneDisplay}
            </a>
            <a
              className="btn bg-veg text-white"
              href={whatsAppUrl(t.hello)}
              target="_blank"
              rel="noreferrer"
            >
              <ChatIcon />
              {t.whatsapp}
            </a>
            <a
              className="btn border border-[#e6c27a] text-[#fffaf3]"
              href={directionsHrefFor(site)}
              target="_blank"
              rel="noreferrer"
            >
              <PinIcon />
              {t.directions}
            </a>
          </div>
        </div>
        <div className="overflow-hidden rounded-[1.75rem] bg-white ring-1 ring-ink/10">
          <iframe
            title={t.mapTitle}
            src={mapEmbedSrcFor(site)}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-72 w-full border-0 md:h-full md:min-h-[420px]"
          />
          <p className="px-4 py-3 text-xs leading-relaxed text-[#6e5b4c]">
            {t.mapFallback}
          </p>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  const { t } = useStore();
  const { site } = useCatalog();
  return (
    <footer className="border-t border-ink/10 px-4 py-8 pb-28 md:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-3">
        <p className="font-display text-2xl font-semibold text-maroon">RKN</p>
        <p className="text-sm font-semibold">{site.name}</p>
        <p className="text-sm text-[#4e4036]">{t.footerNote}</p>
        <p className="text-sm text-[#4e4036]">
          <a className="underline" href={`tel:${site.phoneTel}`}>
            {site.phoneDisplay}
          </a>
          {" · "}
          Prop. {site.proprietor}
        </p>
        <p>
          <Link
            to="/admin/login"
            className="inline-flex min-h-10 items-center rounded-full bg-ink px-4 text-sm font-semibold text-[#fffaf3]"
          >
            {t.staffLogin}
          </Link>
        </p>
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[#4e4036]">
          <span>
            {t.createdBy}{" "}
            <a
              className="font-semibold text-maroon underline underline-offset-2"
              href="https://opuskiln.com"
              target="_blank"
              rel="noreferrer"
            >
              Opuskiln
            </a>
          </span>
          <span aria-hidden="true">·</span>
          <Link
            to="/privacy"
            className="font-semibold text-maroon underline underline-offset-2"
          >
            {t.privacyPolicy}
          </Link>
        </p>
      </div>
    </footer>
  );
}
