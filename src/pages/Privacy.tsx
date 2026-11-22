import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useStore } from "../store.tsx";

export function Privacy() {
  const { t, lang, setLang } = useStore();

  useEffect(() => {
    const previous = document.title;
    document.title = `${t.privacyPolicy} | RKN Punjabi Soya Chaap`;
    const canonical = document.querySelector('link[rel="canonical"]');
    const previousHref = canonical?.getAttribute("href");
    canonical?.setAttribute(
      "href",
      "https://rkn-punjabi-soya-chaap.services.opuskiln.com/privacy",
    );
    return () => {
      document.title = previous;
      if (canonical && previousHref)
        canonical.setAttribute("href", previousHref);
    };
  }, [t.privacyPolicy]);

  return (
    <div className="min-h-screen bg-[#f6efe4] text-ink">
      <header className="border-b border-ink/10 px-4 py-4 md:px-6">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
          <Link
            to="/"
            className="font-display text-2xl font-semibold text-maroon"
          >
            RKN
          </Link>
          <div className="flex items-center gap-2">
            <div
              className="inline-flex rounded-full bg-white p-1 ring-1 ring-ink/10"
              role="group"
              aria-label={t.langLabel}
            >
              <button
                type="button"
                className={`rounded-full px-3 py-1.5 text-sm font-semibold ${lang === "en" ? "bg-maroon text-[#fffaf3]" : "text-ink/70"}`}
                onClick={() => setLang("en")}
              >
                {t.langEn}
              </button>
              <button
                type="button"
                className={`rounded-full px-3 py-1.5 text-sm font-semibold ${lang === "hi" ? "bg-maroon text-[#fffaf3]" : "text-ink/70"}`}
                onClick={() => setLang("hi")}
              >
                {t.langHi}
              </button>
            </div>
            <Link
              to="/"
              className="rounded-full bg-ink px-3 py-2 text-sm font-semibold text-[#fffaf3]"
            >
              {t.privacyBack}
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10 md:px-6 md:py-14">
        <p className="text-xs font-semibold tracking-[0.2em] text-[#8a5a16] uppercase">
          Opuskiln
        </p>
        <h1 className="mt-2 font-display text-4xl leading-none font-semibold sm:text-5xl">
          {t.privacyTitle}
        </h1>
        <p className="mt-3 text-sm text-[#6e5b4c]">{t.privacyUpdated}</p>

        <div className="mt-8 space-y-8 text-base leading-relaxed text-[#4e4036]">
          {t.privacySections.map((section) => (
            <section key={section.title}>
              <h2 className="font-display text-2xl font-semibold text-ink">
                {section.title}
              </h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph} className="mt-2">
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
        </div>

        <p className="mt-10 text-sm text-[#6e5b4c]">
          {t.createdBy}{" "}
          <a
            className="font-semibold text-maroon underline underline-offset-2"
            href="https://opuskiln.com"
            target="_blank"
            rel="noreferrer"
          >
            Opuskiln
          </a>
        </p>
      </main>
    </div>
  );
}
