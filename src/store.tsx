import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { copy, type Copy } from "./data/i18n.ts";
import { itemName, type Lang, type SizeChoice } from "./data/menu.ts";
import { findItem } from "./data/runtime.ts";
import {
  isCartLine,
  orderCount,
  orderTotal,
  portionForAdd,
  type CartLine,
} from "./lib/order.ts";

type Store = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: Copy;
  size: SizeChoice;
  setSize: (size: SizeChoice) => void;
  cart: CartLine[];
  count: number;
  total: number;
  add: (id: string) => void;
  setQty: (id: string, portion: CartLine["portion"], qty: number) => void;
  setLinePortion: (id: string, from: CartLine["portion"], to: CartLine["portion"]) => void;
  remove: (id: string, portion: CartLine["portion"]) => void;
  clear: () => void;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  toast: string | null;
};

const StoreContext = createContext<Store | null>(null);

function readLang(): Lang {
  try {
    return localStorage.getItem("rkn-lang") === "hi" ? "hi" : "en";
  } catch {
    return "en";
  }
}

function readCart(): CartLine[] {
  try {
    const raw = localStorage.getItem("rkn-cart");
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isCartLine);
  } catch {
    return [];
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(readLang);
  const [size, setSize] = useState<SizeChoice>("half");
  const [cart, setCart] = useState<CartLine[]>(readCart);
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.lang = lang === "hi" ? "hi" : "en";
    document.documentElement.classList.toggle("lang-hi", lang === "hi");
    document.title =
      lang === "hi"
        ? "आरकेएन पंजाबी सोया चाप | नैनी, प्रयागराज"
        : "RKN Punjabi Soya Chaap | Pure Veg, Naini Prayagraj";
    try {
      localStorage.setItem("rkn-lang", lang);
    } catch {
      /* ignore private mode */
    }
  }, [lang]);

  useEffect(() => {
    try {
      localStorage.setItem("rkn-cart", JSON.stringify(cart));
    } catch {
      /* ignore quota */
    }
  }, [cart]);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 1700);
    return () => window.clearTimeout(id);
  }, [toast]);

  useEffect(() => {
    document.body.style.overflow = cartOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [cartOpen]);

  const value = useMemo<Store>(() => {
    const t = copy[lang];
    return {
      lang,
      setLang,
      t,
      size,
      setSize,
      cart,
      count: orderCount(cart),
      total: orderTotal(cart),
      add(id) {
        const portion = portionForAdd(id, size);
        setCart((prev) => {
          const found = prev.find((line) => line.id === id && line.portion === portion);
          if (found) {
            return prev.map((line) =>
              line === found ? { ...line, qty: Math.min(30, line.qty + 1) } : line,
            );
          }
          return [...prev, { id, portion, qty: 1 }];
        });
        setToast(t.added(itemName(findItem(id), lang)));
      },
      setQty(id, portion, qty) {
        setCart((prev) => {
          if (qty <= 0) return prev.filter((line) => !(line.id === id && line.portion === portion));
          return prev.map((line) =>
            line.id === id && line.portion === portion ? { ...line, qty: Math.min(30, qty) } : line,
          );
        });
      },
      setLinePortion(id, from, to) {
        if (from === to) return;
        setCart((prev) => {
          const current = prev.find((line) => line.id === id && line.portion === from);
          if (!current) return prev;
          const rest = prev.filter((line) => !(line.id === id && line.portion === from));
          const existing = rest.find((line) => line.id === id && line.portion === to);
          if (existing) {
            return rest.map((line) =>
              line === existing ? { ...line, qty: Math.min(30, line.qty + current.qty) } : line,
            );
          }
          return [...rest, { id, portion: to, qty: current.qty }];
        });
      },
      remove(id, portion) {
        setCart((prev) => prev.filter((line) => !(line.id === id && line.portion === portion)));
      },
      clear() {
        setCart([]);
      },
      cartOpen,
      setCartOpen,
      toast,
    };
  }, [lang, size, cart, cartOpen, toast]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

// oxlint-disable-next-line react/only-export-components -- hook lives beside its provider
export function useStore(): Store {
  const store = useContext(StoreContext);
  if (!store) throw new Error("useStore must be used within StoreProvider");
  return store;
}
