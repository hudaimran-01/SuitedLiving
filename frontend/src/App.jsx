import { useEffect, useRef, useState } from "react";
import { DEMO_PREFS, LISTINGS } from "./data.js";
import { sanitizePrefs } from "./logic.js";
import { useSessionState } from "./storage.js";
import { Compare } from "./components/Compare.jsx";
import { Discover } from "./components/Discover.jsx";
import { Report } from "./components/Report.jsx";
import { Shell } from "./components/Shell.jsx";
import { Welcome } from "./components/Welcome.jsx";

function parseHash(hash) {
  const parts = (hash || "#/").replace(/^#/, "").split("/").filter(Boolean);
  if (parts.length === 0) return { name: "welcome" };
  if (parts[0] === "needs" || parts[0] === "discover") return { name: "discover" };
  if (parts[0] === "compare") return { name: "compare" };
  if (parts[0] === "home" && parts[1]) return { name: "home", id: parts[1] };
  return { name: "welcome" };
}

function useRoute() {
  const [route, setRoute] = useState(() => parseHash(window.location.hash));
  useEffect(() => {
    const onChange = () => {
      if ((window.location.hash || "").startsWith("#/needs")) {
        window.location.replace("#/discover");
        return;
      }
      setRoute(parseHash(window.location.hash));
    };
    window.addEventListener("hashchange", onChange);
    onChange();
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return route;
}

export default function App() {
  const route = useRoute();
  const [prefs, setPrefs] = useSessionState(
    "insideout-prefs",
    { maxPrice: 2000000, beds: null, needs: [], nearby: "" },
    sanitizePrefs,
  );
  const [saved, setSaved] = useSessionState("insideout-saved", [], (value) => {
    const ids = new Set(LISTINGS.map((listing) => listing.id));
    return Array.isArray(value) ? value.filter((id) => ids.has(id)) : [];
  });

  const skipFocus = useRef(true);

  useEffect(() => {
    const listing = LISTINGS.find((item) => item.id === route.id);
    const titles = {
      welcome: "InsideOut",
      discover: "Homes · InsideOut",
      compare: "Compare · InsideOut",
      home: listing ? `${listing.name} · InsideOut` : "Home · InsideOut",
    };
    document.title = titles[route.name] || "InsideOut";
    window.scrollTo(0, 0);
    const heading = document.getElementById("page-title");
    if (!heading) return;
    heading.tabIndex = -1;
    if (skipFocus.current) {
      skipFocus.current = false;
      return;
    }
    heading.focus();
  }, [route.name, route.id]);

  useEffect(() => {
    document.documentElement.dataset.vision = prefs.needs.includes("low-vision") ? "true" : "false";
  }, [prefs.needs]);

  function applyDemo() {
    setPrefs({ ...DEMO_PREFS, needs: [...DEMO_PREFS.needs] });
  }

  function toggleSaved(id) {
    setSaved((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  let page = <Welcome onDemo={applyDemo} />;
  if (route.name === "discover") {
    page = (
      <Discover
        prefs={prefs}
        setPrefs={setPrefs}
        saved={saved}
        onToggleSaved={toggleSaved}
        onDemo={applyDemo}
      />
    );
  }
  if (route.name === "home") {
    page = (
      <Report
        key={route.id}
        homeId={route.id}
        prefs={prefs}
        saved={saved}
        onToggleSaved={toggleSaved}
      />
    );
  }
  if (route.name === "compare") {
    page = <Compare prefs={prefs} saved={saved} onToggleSaved={toggleSaved} />;
  }

  return (
    <Shell route={route} savedCount={saved.length} lowVision={prefs.needs.includes("low-vision")}>
      {page}
    </Shell>
  );
}
