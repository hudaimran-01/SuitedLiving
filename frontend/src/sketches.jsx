function Frame({ children }) {
  return (
    <g>
      <rect width="800" height="480" fill="#efe6d4" />
      <rect y="332" width="800" height="148" fill="#ddd4c3" />
      <text x="28" y="36" fill="#6d655b" fontSize="16" fontFamily="Outfit, system-ui, sans-serif" letterSpacing="1.5">
        SAMPLE SKETCH
      </text>
      {children}
    </g>
  );
}

function Window({ x, y }) {
  return (
    <g>
      <rect x={x} y={y} width="78" height="58" fill="#d7e6ec" stroke="#2a241e" strokeWidth="2" />
      <path d={`M${x + 39} ${y} v58 M${x} ${y + 29} h78`} stroke="#2a241e" strokeWidth="2" />
    </g>
  );
}

function Linden() {
  return (
    <Frame>
      <rect x="0" y="332" width="300" height="148" fill="#5c6560" />
      <rect x="36" y="352" width="120" height="86" fill="none" stroke="#f4efe6" strokeWidth="3" />
      <rect x="164" y="352" width="48" height="86" fill="#6d7672" />
      <path d="M174 362 l28 66 M188 362 l28 66" stroke="#e4ebf4" strokeWidth="3" />
      <rect x="164" y="316" width="430" height="20" fill="#e7dfd0" />
      <rect x="360" y="96" width="380" height="236" fill="#a15a45" stroke="#2a241e" strokeWidth="3" />
      <Window x={400} y={126} />
      <Window x={510} y={126} />
      <rect x="630" y="168" width="70" height="164" fill="#f6f1e7" stroke="#2a241e" strokeWidth="3" />
      <rect x="638" y="176" width="54" height="156" fill="#24312c" />
      <circle cx="678" cy="258" r="3.5" fill="#f6f1e7" />
      <rect x="618" y="328" width="94" height="8" fill="#1f3d32" />
      <rect x="78" y="286" width="12" height="46" fill="#6b4b34" />
      <circle cx="84" cy="258" r="34" fill="#6d8b62" />
    </Frame>
  );
}

function Witherspoon() {
  return (
    <Frame>
      <rect x="300" y="70" width="430" height="262" fill="#7d4a3d" stroke="#2a241e" strokeWidth="3" />
      <Window x={340} y={104} />
      <Window x={450} y={104} />
      <rect x="600" y="150" width="62" height="92" fill="#f6f1e7" stroke="#2a241e" strokeWidth="3" />
      <rect x="608" y="158" width="46" height="84" fill="#241c18" />
      {[0, 1, 2, 3].map((step) => (
        <rect
          key={step}
          x={430 + step * 48}
          y={308 - step * 28}
          width="78"
          height="28"
          fill="#e4dccb"
          stroke="#2a241e"
          strokeWidth="2"
        />
      ))}
      <rect x="24" y="360" width="220" height="78" fill="#6a726c" />
      <path d="M48 398 h170" stroke="#e6e1d6" strokeWidth="2" strokeDasharray="10 8" />
    </Frame>
  );
}

function Quarry() {
  return (
    <Frame>
      <rect x="0" y="360" width="520" height="120" fill="#5e6560" />
      <path d="M36 392 h130 M36 430 h130 M190 392 h130 M190 430 h130" stroke="#c5c8c2" strokeWidth="2" />
      <rect x="0" y="344" width="520" height="16" fill="#8d8478" />
      <rect x="0" y="344" width="520" height="4" fill="#f7f3ea" />
      <circle cx="600" cy="148" r="9" fill="#f6e7b8" stroke="#2a241e" strokeWidth="2" />
      <circle cx="668" cy="148" r="9" fill="#f6e7b8" stroke="#2a241e" strokeWidth="2" />
      <rect x="0" y="308" width="560" height="36" fill="#e7e0d4" />
      <rect x="470" y="108" width="280" height="200" fill="#8d6a4a" stroke="#2a241e" strokeWidth="3" />
      <Window x={510} y={140} />
      <rect x="640" y="176" width="56" height="104" fill="#f6f1e7" stroke="#2a241e" strokeWidth="3" />
      <rect x="648" y="184" width="40" height="96" fill="#24312c" />
      <polygon points="560,344 648,344 648,280 600,280" fill="#d5e0ea" stroke="#2a241e" strokeWidth="3" />
    </Frame>
  );
}

function Palmer() {
  return (
    <Frame>
      <rect x="300" y="48" width="300" height="284" fill="#8a735c" stroke="#2a241e" strokeWidth="3" />
      <Window x={330} y={72} />
      <Window x={450} y={72} />
      <Window x={330} y={168} />
      <Window x={450} y={168} />
      <rect x="470" y="64" width="58" height="78" fill="#f6f1e7" stroke="#2a241e" strokeWidth="3" />
      <rect x="478" y="72" width="42" height="70" fill="#24312c" />
      {[0, 1, 2, 3, 4, 5, 6].map((step) => (
        <rect
          key={step}
          x={70 + step * 52}
          y={308 - step * 32}
          width="70"
          height="24"
          fill="#e4dccb"
          stroke="#2a241e"
          strokeWidth="2"
        />
      ))}
      <rect x="20" y="360" width="160" height="64" fill="#6a726c" />
    </Frame>
  );
}

function LindenDoors() {
  return (
    <Frame>
      <rect x="70" y="70" width="660" height="340" fill="#f7f1e6" stroke="#2a241e" strokeWidth="2" />
      <rect x="110" y="150" width="70" height="190" fill="#c4a574" stroke="#2a241e" strokeWidth="2" />
      <path d="M180 160 h210 v180 h-210 z" fill="none" stroke="#1f3d32" strokeWidth="3" />
      <text x="200" y="250" fill="#1f3d32" fontSize="22" fontFamily="Outfit, system-ui, sans-serif">
        Bedroom door in frame
      </text>
      <path d="M520 150 h150 v190" fill="none" stroke="#9d3f2c" strokeWidth="3" strokeDasharray="8 6" />
      <text x="520" y="250" fill="#6e2618" fontSize="22" fontFamily="Outfit, system-ui, sans-serif">
        Bathroom door
      </text>
      <text x="520" y="280" fill="#6e2618" fontSize="22" fontFamily="Outfit, system-ui, sans-serif">
        cut off
      </text>
    </Frame>
  );
}

function LindenBath() {
  return (
    <Frame>
      <rect x="90" y="80" width="620" height="320" fill="#f4f7f6" stroke="#2a241e" strokeWidth="2" />
      <rect x="130" y="130" width="200" height="150" fill="#d7e4ea" stroke="#1f3d32" strokeWidth="3" />
      <text x="156" y="210" fill="#1f3d32" fontSize="22" fontFamily="Outfit, system-ui, sans-serif">
        No shower curb
      </text>
      <circle cx="520" cy="250" r="70" fill="none" stroke="#9d3f2c" strokeWidth="3" strokeDasharray="8 6" />
      <text x="430" y="360" fill="#6e2618" fontSize="22" fontFamily="Outfit, system-ui, sans-serif">
        Turn radius not measured
      </text>
    </Frame>
  );
}

function Note({ lines }) {
  return (
    <Frame>
      <rect x="140" y="80" width="520" height="320" fill="#fffdf8" stroke="#2a241e" strokeWidth="2" />
      <text x="180" y="150" fill="#1a1714" fontSize="28" fontFamily="Fraunces, Georgia, serif">
        Listing note
      </text>
      {lines.map((line, index) => (
        <text
          key={line}
          x="180"
          y={230 + index * 58}
          fill="#1a1714"
          fontSize="26"
          fontFamily="Outfit, system-ui, sans-serif"
        >
          {line}
        </text>
      ))}
    </Frame>
  );
}

function Listing({ floor, elevator }) {
  return (
    <Frame>
      <rect x="140" y="70" width="520" height="340" fill="#fffdf8" stroke="#2a241e" strokeWidth="2" />
      <text x="180" y="130" fill="#1a1714" fontSize="28" fontFamily="Fraunces, Georgia, serif">
        Listing note
      </text>
      <text x="180" y="210" fill="#1a1714" fontSize="26" fontFamily="Outfit, system-ui, sans-serif">
        {floor}
      </text>
      <text x="180" y="270" fill="#1a1714" fontSize="26" fontFamily="Outfit, system-ui, sans-serif">
        {elevator}
      </text>
      <text x="180" y="340" fill="#5e584e" fontSize="22" fontFamily="Outfit, system-ui, sans-serif">
        Entrance: not described
      </text>
    </Frame>
  );
}

function NoScan() {
  return (
    <Frame>
      <rect x="160" y="90" width="480" height="280" fill="none" stroke="#8a8174" strokeWidth="3" strokeDasharray="10 8" />
      <text x="250" y="220" fill="#3f3a33" fontSize="28" fontFamily="Fraunces, Georgia, serif">
        No interior scan
      </text>
      <text x="230" y="270" fill="#5e584e" fontSize="20" fontFamily="Outfit, system-ui, sans-serif">
        Doorways and the bathroom are unchecked
      </text>
    </Frame>
  );
}

function StreetLevel() {
  return (
    <Frame>
      <rect x="0" y="300" width="800" height="180" fill="#d9d2c3" />
      <rect x="70" y="250" width="660" height="50" fill="#c4b8a4" />
      <path d="M70 300 L730 300" stroke="#fffdf8" strokeWidth="8" strokeDasharray="28 18" />
      <rect x="250" y="150" width="300" height="100" fill="#efe7d8" stroke="#1a1714" strokeWidth="3" />
      <text x="310" y="210" fill="#3f3a33" fontSize="22" fontFamily="Outfit, system-ui, sans-serif">
        Sample store
      </text>
    </Frame>
  );
}

function StreetGap() {
  return (
    <Frame>
      <rect x="0" y="300" width="800" height="180" fill="#d9d2c3" />
      <rect x="40" y="250" width="280" height="50" fill="#c4b8a4" />
      <rect x="480" y="250" width="280" height="50" fill="#c4b8a4" />
      <rect x="360" y="300" width="80" height="28" fill="#8a8174" />
      <text x="250" y="180" fill="#1a1714" fontSize="26" fontFamily="Fraunces, Georgia, serif">
        No curb ramp
      </text>
      <text x="230" y="220" fill="#5e584e" fontSize="18" fontFamily="Outfit, system-ui, sans-serif">
        Sample corner, not a city map
      </text>
    </Frame>
  );
}

function StreetHill() {
  return (
    <Frame>
      <polygon points="40,360 760,180 760,430 40,430" fill="#d9d2c3" />
      <polygon points="40,310 760,140 760,190 40,360" fill="#c4b8a4" />
      <text x="250" y="250" fill="#1a1714" fontSize="26" fontFamily="Fraunces, Georgia, serif">
        Steep sample block
      </text>
    </Frame>
  );
}

function StreetSignal() {
  return (
    <Frame>
      <rect x="0" y="300" width="800" height="180" fill="#d9d2c3" />
      <rect x="70" y="250" width="660" height="50" fill="#c4b8a4" />
      <rect x="560" y="90" width="70" height="180" fill="#1a1714" />
      <circle cx="595" cy="140" r="18" fill="#9d3f2c" />
      <text x="150" y="180" fill="#1a1714" fontSize="24" fontFamily="Fraunces, Georgia, serif">
        Crossing signal
      </text>
    </Frame>
  );
}

const SCENES = {
  linden: Linden,
  witherspoon: Witherspoon,
  quarry: Quarry,
  palmer: Palmer,
  "linden-doors": LindenDoors,
  "linden-bath": LindenBath,
  "listing-quarry": () => <Listing floor="Floor: 2" elevator="Elevator: listed" />,
  "listing-witherspoon": () => <Listing floor="Floor: 2" elevator="Elevator: listed" />,
  "note-intercom": () => <Note lines={["Video intercom: listed"]} />,
  "note-strobe": () => <Note lines={["Strobe smoke alarms: listed"]} />,
  "note-doorbell": () => <Note lines={["Video doorbell: listed"]} />,
  "no-scan": NoScan,
  "street-level": StreetLevel,
  "street-gap": StreetGap,
  "street-hill": StreetHill,
  "street-signal": StreetSignal,
};

export function EvidenceSketch({ scene, label }) {
  const Scene = SCENES[scene] || NoScan;
  return (
    <svg className="sketch-svg" viewBox="0 0 800 480" role="img" aria-label={label}>
      <Scene />
    </svg>
  );
}
