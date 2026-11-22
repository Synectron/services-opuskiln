import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { fetchPublicMenu, fetchPublicSettings } from "../lib/api.ts";
import { MENU, type MenuItem } from "./menu.ts";
import { setRuntime } from "./runtime.ts";
import { DEFAULT_SITE, type ShopSettings } from "./site.ts";

type Catalog = {
  menu: MenuItem[];
  site: ShopSettings;
  loading: boolean;
  source: "api" | "fallback";
  refresh: () => Promise<void>;
};

const CatalogContext = createContext<Catalog | null>(null);

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [menu, setMenu] = useState<MenuItem[]>(MENU);
  const [site, setSite] = useState<ShopSettings>(DEFAULT_SITE);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<"api" | "fallback">("fallback");

  const refresh = async () => {
    try {
      const [menuRes, settingsRes] = await Promise.all([fetchPublicMenu(), fetchPublicSettings()]);
      const nextMenu = menuRes.items ?? [];
      const nextSite = settingsRes.settings ?? DEFAULT_SITE;
      if (nextMenu.length === 0) throw new Error("Empty menu");
      setMenu(nextMenu);
      setSite(nextSite);
      setRuntime(nextMenu, nextSite);
      setSource("api");
      try {
        localStorage.setItem("rkn-menu-cache", JSON.stringify(nextMenu));
        localStorage.setItem("rkn-site-cache", JSON.stringify(nextSite));
      } catch {
        /* ignore */
      }
    } catch {
      let cachedMenu: MenuItem[] | null = null;
      let cachedSite: ShopSettings | null = null;
      try {
        const rawMenu = localStorage.getItem("rkn-menu-cache");
        const rawSite = localStorage.getItem("rkn-site-cache");
        if (rawMenu) cachedMenu = JSON.parse(rawMenu) as MenuItem[];
        if (rawSite) cachedSite = JSON.parse(rawSite) as ShopSettings;
      } catch {
        /* ignore */
      }
      const nextMenu = cachedMenu?.length ? cachedMenu : MENU;
      const nextSite = cachedSite ?? DEFAULT_SITE;
      setMenu(nextMenu);
      setSite(nextSite);
      setRuntime(nextMenu, nextSite);
      setSource("fallback");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const value = useMemo(
    () => ({ menu, site, loading, source, refresh }),
    [menu, site, loading, source],
  );

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

// oxlint-disable-next-line react/only-export-components
export function useCatalog(): Catalog {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error("useCatalog must be used within CatalogProvider");
  return ctx;
}
