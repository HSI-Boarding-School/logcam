export const API_BASE: string = import.meta.env.VITE_API_BASE || "/api";

export function resolveWsBase(): string {
  const wsEnv = (import.meta as any).env?.VITE_WS_BASE as string | undefined;
  const cleaned = (wsEnv || "").replace(/\/$/, "");
  if (cleaned) return cleaned; // explicit env
  if (typeof window !== "undefined") {
    const scheme = window.location.protocol === "https:" ? "wss" : "ws";
    return `${scheme}://${window.location.host}`;
  }
  return "ws://localhost:3000"; // SSR fallback (unused in our case)
}

console.log("ENVIROMENT", import.meta.env.VITE_API_BASE);
