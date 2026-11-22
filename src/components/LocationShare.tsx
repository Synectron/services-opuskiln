import { useState } from "react";
import type { Copy } from "../data/i18n.ts";
import { accuracyMeters, mapsEmbedSrc, mapsLink, type SharedLocation } from "../lib/order.ts";
import { PinIcon } from "./Icons.tsx";

type GeoError = "denied" | "timeout" | "unavailable" | "unsupported";
type Status = "idle" | "loading" | "ready" | "error";

export function LocationShare({
  t,
  location,
  onChange,
}: {
  t: Copy;
  location: SharedLocation | null;
  onChange: (location: SharedLocation | null) => void;
}) {
  const [status, setStatus] = useState<Status>(location ? "ready" : "idle");
  const [error, setError] = useState<GeoError | null>(null);

  function share() {
    if (!("geolocation" in navigator)) {
      setStatus("error");
      setError("unsupported");
      return;
    }
    setStatus("loading");
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        onChange({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
        setStatus("ready");
      },
      (err) => {
        setStatus("error");
        if (err.code === err.PERMISSION_DENIED) setError("denied");
        else if (err.code === err.TIMEOUT) setError("timeout");
        else setError("unavailable");
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  }

  const message =
    error === "denied"
      ? t.locDenied
      : error === "timeout"
        ? t.locTimeout
        : error === "unsupported"
          ? t.locUnsupported
          : error === "unavailable"
            ? t.locUnavailable
            : null;

  return (
    <section className="rounded-2xl bg-[#fffaf3] p-3 ring-1 ring-[#e4d5c0]" aria-labelledby="loc-title">
      <h3 id="loc-title" className="text-sm font-semibold text-ink">
        {t.locTitle}
      </h3>
      <p className="mt-1 text-xs leading-relaxed text-[#6e5b4c]">{t.locNudge}</p>
      {status === "ready" && location ? (
        <div className="mt-3">
          <p className="text-sm font-semibold text-veg" role="status">
            {t.locAccuracy(accuracyMeters(location.accuracy))}
          </p>
          <iframe
            title={t.locPreview}
            src={mapsEmbedSrc(location.lat, location.lng)}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="mt-2 h-28 w-full rounded-xl border-0 bg-[#eadfce]"
          />
          <div className="mt-1 flex flex-wrap items-center gap-x-3">
            <a
              className="inline-flex min-h-11 items-center text-sm font-semibold text-maroon underline"
              href={mapsLink(location.lat, location.lng)}
              target="_blank"
              rel="noreferrer"
            >
              {t.locViewMap}
            </a>
            <button type="button" className="min-h-11 text-sm font-semibold text-ink" onClick={share}>
              {t.locUpdate}
            </button>
            <button
              type="button"
              className="min-h-11 text-sm font-semibold text-[#6e5b4c]"
              onClick={() => {
                onChange(null);
                setStatus("idle");
                setError(null);
              }}
            >
              {t.locClear}
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={share}
          disabled={status === "loading"}
          aria-busy={status === "loading"}
          className="mt-3 flex min-h-12 w-full flex-wrap items-center justify-center gap-2 rounded-full bg-maroon px-3 py-2 text-center text-sm font-semibold leading-snug text-[#fffaf3] disabled:opacity-70"
        >
          {status === "loading" ? (
            <>
              <span className="loc-spin" aria-hidden="true" />
              {t.locLoading}
            </>
          ) : (
            <>
              <PinIcon className="size-5" />
              {t.locButton}
            </>
          )}
        </button>
      )}
      {message && (
        <p className="mt-2 text-xs leading-relaxed text-maroon" role="alert">
          {message}
        </p>
      )}
    </section>
  );
}
