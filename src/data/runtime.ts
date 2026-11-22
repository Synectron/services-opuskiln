import { MENU, findItemIn, type MenuItem } from "./menu.ts";
import { DEFAULT_SITE, type ShopSettings } from "./site.ts";

let menu: MenuItem[] = MENU;
let site: ShopSettings = { ...DEFAULT_SITE };

export function getMenu(): MenuItem[] {
  return menu;
}

export function getSite(): ShopSettings {
  return site;
}

export function setRuntime(nextMenu: MenuItem[], nextSite: ShopSettings): void {
  menu = nextMenu;
  site = nextSite;
}

export function findItem(id: string): MenuItem {
  return findItemIn(menu, id);
}

export function findItemSafe(id: string): MenuItem | undefined {
  return menu.find((entry) => entry.id === id);
}
