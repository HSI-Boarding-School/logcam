import { createRoot } from "react-dom/client";
import App from "./App.js";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
console.log("VITE_API_BASE =", import.meta.env.VITE_API_BASE);

