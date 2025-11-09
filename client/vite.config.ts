import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const allowedHosts = (env.VITE_ALLOWED_HOSTS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return {
    server: {
      host: "0.0.0.0",
      port: 8080,
      strictPort: true,
      watch: { usePolling: true },
      allowedHosts: allowedHosts.length ? allowedHosts : ["localhost", "127.0.0.1"],
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
