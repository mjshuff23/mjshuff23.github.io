import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const searchParams = new URLSearchParams(window.location.search);
const redirectedPath = searchParams.get("__gh_path");

if (redirectedPath) {
  const redirectedSearch = searchParams.get("__gh_search") ?? "";
  const redirectedHash = searchParams.get("__gh_hash") ?? "";
  const nextUrl = `${redirectedPath}${redirectedSearch}${redirectedHash}`;

  window.history.replaceState(null, "", nextUrl);
}

createRoot(document.getElementById("root")!).render(<App />);
