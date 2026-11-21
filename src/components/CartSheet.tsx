import { useEffect, useId, useRef, useState } from "react";
import { SITE } from "../data/site.ts";
import { findItem, itemName, portionName } from "../data/menu.ts";
import { buildWhatsAppText, deliveryGap, inr, lineCost, whatsAppUrl } from "../lib/order.ts";
import { useStore } from "../store.tsx";
import { ChatIcon } from "./Icons.tsx";

export function CartSheet() {
  const { t, lang, cart, total, cartOpen, setCartOpen, setQty, setLinePortion, remove, clear } = useStore();
  const ref = useRef<HTMLDialogElement>(null);
  const nameId = useId();
  const addressId = useId();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const gap = deliveryGap(total);
  const pct = Math.min(100, Math.round((total / SITE.freeDelivery) * 100));
  const message = buildWhatsAppText({ lang, lines: cart, name, address });

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (cartOpen && !dialog.open) dialog.showModal();
    else if (!cartOpen && dialog.open) dialog.close();
  }, [cartOpen]);

  return (
    <dialog
      ref={ref}
      className="sheet"
      aria-labelledby="cart-title"
      onClose={() => setCartOpen(false)}
      onClick={(event) => {
        if (event.target === event.currentTarget) setCartOpen(false);
      }}
    >
      <div className="flex max-h-[inherit] min-h-0 flex-1 flex-col">
        <div className="flex items-center justify-between gap-3 px-4 pt-3 pb-3">
          <div>
            <div className="mx-auto mb-2 h-1.5 w-10 rounded-full bg-ink/15 md:hidden" aria-hidden="true" />
            <h2 id="cart-title" className="font-display text-3xl leading-none font-semibold">
              {t.cartTitle}
            </h2>
          </div>
          <button type="button" onClick={() => setCartOpen(false)} className="min-h-11 rounded-full px-3 text-sm font-semibold text-maroon">
            {t.close}
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="px-4 pt-6 pb-8">
            <p className="font-semibold text-ink">{t.emptyTitle}</p>
            <p className="mt-1 text-sm text-[#6e5b4c]">{t.emptyBody}</p>
            <button
              type="button"
              className="btn btn-call mt-5"
              onClick={() => {
                setCartOpen(false);
                document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              {t.browseMenu}
            </button>
          </div>
        ) : (
          <>
            <div className="min-h-0 flex-1 overflow-y-auto px-4">
              <ul className="divide-y divide-[#eadfce]">
                {cart.map((line) => {
                  const item = findItem(line.id);
                  const title = itemName(item, lang);
                  return (
                    <li key={`${line.id}-${line.portion}`} className="py-3">
                      <div className="flex items-start justify-between gap-3">
                        <p className="font-semibold text-ink">{title}</p>
                        <p className="shrink-0 font-semibold tabular-nums">{inr(lineCost(line))}</p>
                      </div>
                      {item.full != null && (
                        <div className="mt-2 flex gap-1">
                          {(["half", "full"] as const).map((choice) => (
                            <button
                              key={choice}
                              type="button"
                              aria-pressed={line.portion === choice}
                              onClick={() => setLinePortion(line.id, line.portion, choice)}
                              className={`min-h-9 rounded-full px-3 text-xs font-semibold ${
                                line.portion === choice ? "bg-maroon text-white" : "bg-ink/5 text-ink"
                              }`}
                            >
                              {portionName(item, choice, lang)} · {inr(item.full != null && choice === "full" ? item.full : item.half)}
                            </button>
                          ))}
                        </div>
                      )}
                      {item.full == null && (
                        <p className="mt-1 text-xs text-[#6e5b4c]">{portionName(item, "single", lang)}</p>
                      )}
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center rounded-full bg-ink/5">
                          <button
                            type="button"
                            className="grid size-11 place-items-center text-lg"
                            aria-label={`${t.decrease} ${title}`}
                            onClick={() => setQty(line.id, line.portion, line.qty - 1)}
                          >
                            −
                          </button>
                          <span className="min-w-6 text-center text-sm font-semibold tabular-nums">{line.qty}</span>
                          <button
                            type="button"
                            className="grid size-11 place-items-center text-lg"
                            aria-label={`${t.increase} ${title}`}
                            onClick={() => setQty(line.id, line.portion, line.qty + 1)}
                          >
                            +
                          </button>
                        </div>
                        <button type="button" className="min-h-11 text-sm font-semibold text-maroon" onClick={() => remove(line.id, line.portion)}>
                          {t.remove}
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
              <button type="button" onClick={clear} className="mt-2 mb-4 text-sm font-semibold text-[#6e5b4c] underline">
                {t.clearCart}
              </button>
            </div>

            <form
              className="border-t border-[#eadfce] bg-[#fffaf3] px-4 pt-3 pb-[max(0.85rem,env(safe-area-inset-bottom))]"
              onSubmit={(event) => event.preventDefault()}
            >
              <div className="mb-3">
                <div className="mb-1 flex items-center justify-between text-xs font-semibold">
                  <span className={gap === 0 ? "text-veg" : "text-[#6e5b4c]"}>
                    {gap === 0 ? t.deliveryUnlocked : t.deliveryNeed(inr(gap))}
                  </span>
                  <span className="tabular-nums text-[#6e5b4c]">{inr(SITE.freeDelivery)}</span>
                </div>
                <div
                  className="h-2 overflow-hidden rounded-full bg-[#eadfce]"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={pct}
                  aria-label={gap === 0 ? t.deliveryUnlocked : t.deliveryNeed(inr(gap))}
                >
                  <div className="h-full rounded-full bg-veg transition-[width] duration-500" style={{ width: `${pct}%` }} />
                </div>
              </div>
              <div className="grid gap-2">
                <label className="grid gap-1 text-sm font-semibold" htmlFor={nameId}>
                  {t.name}
                  <input
                    id={nameId}
                    name="name"
                    autoComplete="name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder={t.namePh}
                    className="h-12 rounded-xl bg-white px-3 text-base font-medium ring-1 ring-[#e4d5c0] outline-none focus-visible:ring-2 focus-visible:ring-maroon"
                  />
                </label>
                <label className="grid gap-1 text-sm font-semibold" htmlFor={addressId}>
                  {t.address}
                  <textarea
                    id={addressId}
                    name="street-address"
                    autoComplete="street-address"
                    value={address}
                    onChange={(event) => setAddress(event.target.value)}
                    placeholder={t.addressPh}
                    rows={2}
                    className="rounded-xl bg-white px-3 py-2 text-base font-medium ring-1 ring-[#e4d5c0] outline-none focus-visible:ring-2 focus-visible:ring-maroon"
                  />
                </label>
              </div>
              <p className="mt-3 flex items-center justify-between text-base font-semibold" aria-live="polite">
                <span>{t.total}</span>
                <span className="tabular-nums">{inr(total)}</span>
              </p>
              <a className="btn btn-wa mt-3 w-full" href={whatsAppUrl(message)} target="_blank" rel="noreferrer">
                <ChatIcon className="size-5" />
                {t.waOrder}
              </a>
              <p className="mt-2 text-center text-xs leading-relaxed text-[#6e5b4c]">{t.waHint}</p>
            </form>
          </>
        )}
      </div>
    </dialog>
  );
}

export function OrderBar() {
  const { t, count, total, cartOpen, setCartOpen } = useStore();
  if (count === 0 || cartOpen) return null;
  const gap = deliveryGap(total);
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-ink/10 bg-[#fffaf3]/95 px-3 pt-2 pb-[max(0.6rem,env(safe-area-inset-bottom))] shadow-[0_-10px_30px_rgba(36,23,15,0.08)] backdrop-blur-md md:hidden">
      <div className="mx-auto flex max-w-6xl items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold tabular-nums">
            {t.items(count)} · {inr(total)}
          </p>
          <p className={`truncate text-xs ${gap === 0 ? "text-veg" : "text-[#6e5b4c]"}`}>
            {gap === 0 ? t.deliveryUnlocked : t.deliveryNeed(inr(gap))}
          </p>
        </div>
        <button type="button" onClick={() => setCartOpen(true)} className="btn btn-wa min-h-11 px-4">
          {t.viewOrder}
        </button>
      </div>
    </div>
  );
}

export function WhatsAppFab() {
  const { t, count, cartOpen } = useStore();
  if (cartOpen) return null;
  const href = whatsAppUrl(t.hello);
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={t.fab}
      className={`fixed right-4 z-30 grid size-14 place-items-center rounded-full bg-veg text-white shadow-[0_12px_30px_rgba(15,122,60,0.35)] ${
        count > 0 ? "bottom-[5.6rem] md:bottom-6" : "bottom-[max(1.1rem,env(safe-area-inset-bottom))]"
      }`}
    >
      <ChatIcon className="size-7" />
    </a>
  );
}

export function Toast() {
  const { toast } = useStore();
  if (!toast) return null;
  return (
    <p role="status" className="fixed bottom-28 left-1/2 z-30 -translate-x-1/2 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-[#fffaf3] shadow-lg">
      {toast}
    </p>
  );
}
