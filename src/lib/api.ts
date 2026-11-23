import type { MenuItem } from "../data/menu.ts";
import type { ReviewsPayload } from "../data/reviews.ts";
import type { ShopSettings } from "../data/site.ts";

export type AdminMenuItem = MenuItem & {
  active: boolean;
  sortOrder: number;
  updatedAt?: string;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    credentials: "include",
    headers: {
      "content-type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });
  const data = (await response.json().catch(() => ({}))) as T & {
    error?: string;
  };
  if (!response.ok) {
    throw new Error(data.error || `Request failed (${response.status})`);
  }
  return data;
}

export function fetchPublicMenu(): Promise<{ items: MenuItem[] }> {
  return request("/api/menu");
}

export function fetchPublicSettings(): Promise<{ settings: ShopSettings }> {
  return request("/api/settings");
}

export function fetchPublicReviews(): Promise<ReviewsPayload> {
  return request("/api/reviews");
}

export function login(
  email: string,
  password: string,
): Promise<{ ok: boolean; email: string; role: string }> {
  return request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function logout(): Promise<{ ok: boolean }> {
  return request("/api/auth/logout", { method: "POST" });
}

export function fetchMe(): Promise<{ email: string; role: string }> {
  return request("/api/auth/me");
}

export function fetchAdminMenu(): Promise<{ items: AdminMenuItem[] }> {
  return request("/api/admin/menu");
}

export function createMenuItem(
  body: Partial<AdminMenuItem>,
): Promise<{ item: AdminMenuItem }> {
  return request("/api/admin/menu", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function updateMenuItem(
  id: string,
  body: Partial<AdminMenuItem>,
): Promise<{ item: AdminMenuItem }> {
  return request(`/api/admin/menu/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export function deactivateMenuItem(id: string): Promise<{ ok: boolean }> {
  return request(`/api/admin/menu/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export function fetchAdminSettings(): Promise<{ settings: ShopSettings }> {
  return request("/api/admin/settings");
}

export function updateSettings(
  body: Partial<ShopSettings>,
): Promise<{ settings: ShopSettings }> {
  return request("/api/admin/settings", {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export type AdminRole = "super_admin" | "admin";

export type AdminAccount = {
  email: string;
  role: AdminRole;
  active: boolean;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
};

export function fetchAdmins(): Promise<{ admins: AdminAccount[] }> {
  return request("/api/admin/admins");
}

export function createAdmin(body: {
  email: string;
  password: string;
  role?: AdminRole;
}): Promise<{ admin: AdminAccount }> {
  return request("/api/admin/admins", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function updateAdmin(
  email: string,
  body: { role?: AdminRole; active?: boolean; password?: string },
): Promise<{ admin: AdminAccount }> {
  return request(`/api/admin/admins/${encodeURIComponent(email)}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export function deactivateAdmin(email: string): Promise<{ ok: boolean }> {
  return request(`/api/admin/admins/${encodeURIComponent(email)}`, {
    method: "DELETE",
  });
}

export type OrderStatus = "new" | "accepted" | "done" | "cancelled";

export type OrderItemSnapshot = {
  id: string;
  portion: "half" | "full" | "single";
  qty: number;
  name: string;
  nameHi: string;
  portionLabel: string;
  unitPrice: number;
  lineTotal: number;
};

export type ShopOrder = {
  id: string;
  status: OrderStatus;
  lang: "en" | "hi";
  customerName: string;
  phone: string;
  customerId: string | null;
  address: string;
  landmark: string;
  location: { lat: number; lng: number; accuracy: number } | null;
  items: OrderItemSnapshot[];
  total: number;
  message: string;
  createdAt: string;
  updatedAt: string;
};

export type CustomerAccount = {
  id: string;
  phone: string;
  name: string;
};

export function createOrder(body: {
  lang: "en" | "hi";
  lines: { id: string; portion: "half" | "full" | "single"; qty: number }[];
  name: string;
  phone?: string;
  address: string;
  landmark?: string;
  location?: { lat: number; lng: number; accuracy: number } | null;
  message?: string;
}): Promise<{ order: ShopOrder }> {
  return request("/api/orders", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function customerRegister(body: {
  phone: string;
  password: string;
  name: string;
}): Promise<{ ok: boolean; customer: CustomerAccount }> {
  return request("/api/account/register", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function customerLogin(
  phone: string,
  password: string,
): Promise<{ ok: boolean; customer: CustomerAccount }> {
  return request("/api/account/login", {
    method: "POST",
    body: JSON.stringify({ phone, password }),
  });
}

export function customerLogout(): Promise<{ ok: boolean }> {
  return request("/api/account/logout", { method: "POST" });
}

export function fetchCustomerMe(): Promise<{ customer: CustomerAccount }> {
  return request("/api/account/me");
}

export function fetchCustomerOrders(): Promise<{
  customer: CustomerAccount;
  orders: ShopOrder[];
}> {
  return request("/api/account/orders");
}

export type DayOrderStats = {
  orderCount: number;
  revenue: number;
  newCount: number;
  acceptedCount: number;
  doneCount: number;
  cancelledCount: number;
};

export type DaySummary = DayOrderStats & {
  day: string;
  isToday: boolean;
};

export type AdminOrdersPayload = {
  day: string;
  today: string;
  prevDay: string;
  nextDay: string;
  isToday: boolean;
  stats: DayOrderStats;
  days: DaySummary[];
  orders: ShopOrder[];
  newCount: number;
};

export function fetchAdminOrders(params?: {
  day?: string;
  status?: OrderStatus;
  limit?: number;
}): Promise<AdminOrdersPayload> {
  const query = new URLSearchParams();
  if (params?.day) query.set("day", params.day);
  if (params?.status) query.set("status", params.status);
  if (params?.limit) query.set("limit", String(params.limit));
  const suffix = query.size ? `?${query}` : "";
  return request(`/api/admin/orders${suffix}`);
}

export function updateOrderStatus(
  id: string,
  status: OrderStatus,
): Promise<{ order: ShopOrder }> {
  return request(`/api/admin/orders/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}
