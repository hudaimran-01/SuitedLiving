import { useEffect, useRef, useState } from "react";
import { DEMO_PREFS, LISTINGS, normalizeListings } from "./data.js";
import { interiorProperty } from "./interior.js";
import { sanitizePrefs } from "./logic.js";
import { useSessionState } from "./storage.js";
import { Compare } from "./components/Compare.jsx";
import { Discover } from "./components/Discover.jsx";
import { InteriorReport } from "./components/Interior.jsx";
import { Report } from "./components/Report.jsx";
import { Shell } from "./components/Shell.jsx";
import { Welcome } from "./components/Welcome.jsx";

function parseHash(hash) {
  const parts = (hash || "#/").replace(/^#/, "").split("/").filter(Boolean);
  if (parts.length === 0) return { name: "welcome" };
  if (parts[0] === "needs" || parts[0] === "discover") return { name: "discover" };
  if (parts[0] === "compare") return { name: "compare" };
  if (parts[0] === "home" && parts[1]) return { name: "home", id: parts[1] };
  if (parts[0] === "interior" && parts[1]) return { name: "interior", id: parts[1] };
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

function useListings() {
  const [listings, setListings] = useState(LISTINGS);
  useEffect(() => {
    let cancel = false;
    fetch("/api/listings")
      .then((response) => {
        if (!response.ok) throw new Error("listings unavailable");
        return response.json();
      })
      .then((data) => {
        const next = normalizeListings(data);
        if (!cancel && next.length > 0) setListings(next);
      })
      .catch(() => {});
    return () => {
      cancel = true;
    };
  }, []);
  return listings;
}

export default function App() {
  const route = useRoute();
  const [prefs, setPrefs] = useSessionState(
    "suitedliving-prefs",
    { maxPrice: 2000000, beds: null, needs: [], nearby: "" },
    sanitizePrefs,
  );
  const listings = useListings();
  const [saved, setSaved] = useSessionState("suitedliving-saved", [], (value) => {
    const ids = new Set(LISTINGS.map((listing) => listing.id));
    return Array.isArray(value) ? value.filter((id) => ids.has(id)) : [];
  });

  const skipFocus = useRef(true);

  useEffect(() => {
    const listing = listings.find((item) => item.id === route.id);
    const scored = interiorProperty(route.id);
    const titles = {
      welcome: "SuitedLiving",
      discover: "Homes · SuitedLiving",
      compare: "Compare · SuitedLiving",
      home: listing ? `${listing.name} · SuitedLiving` : "Home · SuitedLiving",
      interior: scored ? `${scored.name} · SuitedLiving` : "Interior score · SuitedLiving",
    };
    document.title = titles[route.name] || "SuitedLiving";
    window.scrollTo(0, 0);
    const heading = document.getElementById("page-title");
    if (!heading) return;
    heading.tabIndex = -1;
    if (skipFocus.current) {
      skipFocus.current = false;
      return;
    }
    heading.focus();
  }, [listings, route.name, route.id]);

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

  let page = <Welcome listings={listings} onDemo={applyDemo} />;
  if (route.name === "discover") {
    page = (
      <Discover
        listings={listings}
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
        listings={listings}
        homeId={route.id}
        prefs={prefs}
        saved={saved}
        onToggleSaved={toggleSaved}
      />
    );
  }
  if (route.name === "interior") {
    page = <InteriorReport key={route.id} homeId={route.id} needIds={prefs.needs} />;
  }
  if (route.name === "compare") {
    page = <Compare listings={listings} prefs={prefs} saved={saved} onToggleSaved={toggleSaved} />;
  }

  return (
    <Shell route={route} savedCount={saved.length} lowVision={prefs.needs.includes("low-vision")}>
      {page}
    </Shell>
  );
}
