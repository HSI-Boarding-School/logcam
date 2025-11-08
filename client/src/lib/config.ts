export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "/api";

export const WS_BASE = (process.env.NEXT_PUBLIC_WS_BASE || "").replace(/\/$/, "");

export function resolveWsBase(): string {
  if (WS_BASE) return WS_BASE; // explicit env
  if (typeof window !== "undefined") {
    const scheme = window.location.protocol === "https:" ? "wss" : "ws";
    return `${scheme}://${window.location.host}`;
  }
  return "ws://localhost:3000"; // SSR fallback (unused in our case)
}

