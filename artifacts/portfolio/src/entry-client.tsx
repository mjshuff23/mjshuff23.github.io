import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Portfolio root element was not found.");
}

const searchParams = new URLSearchParams(window.location.search);
const redirectedPath = searchParams.get("__gh_path");

if (redirectedPath) {
  const redirectedSearch = searchParams.get("__gh_search") ?? "";
  const redirectedHash = searchParams.get("__gh_hash") ?? "";
  const nextUrl = `${redirectedPath}${redirectedSearch}${redirectedHash}`;

  window.history.replaceState(null, "", nextUrl);
}

const canHydratePrerenderedHome =
  root.hasChildNodes() &&
  !redirectedPath &&
  window.location.pathname === "/";

if (canHydratePrerenderedHome) {
  hydrateRoot(root, <App />);
} else {
  createRoot(root).render(<App />);
}
