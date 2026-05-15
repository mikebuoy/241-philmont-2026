export default function IconPreview() {
  const sw = 1.6;
  const opts = [
    {
      label: "A",
      desc: "Front view — body + side pads + arch",
      svg: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
          {/* body */}
          <rect x="4" y="5" width="16" height="16" rx="2" />
          {/* side strap pads */}
          <rect x="1" y="8" width="3" height="8" rx="1" />
          <rect x="20" y="8" width="3" height="8" rx="1" />
          {/* top arch handle */}
          <path d="M9 5A3 3 0 0 1 15 5" />
          {/* front pocket */}
          <rect x="6" y="15" width="12" height="5" rx="1.5" />
          {/* pocket zipper line */}
          <path d="M8 18h8" />
        </svg>
      ),
    },
    {
      label: "B",
      desc: "Top clips + arch + pocket",
      svg: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
          {/* body */}
          <rect x="4" y="5" width="16" height="16" rx="2" />
          {/* side strap pads */}
          <rect x="1" y="8" width="3" height="8" rx="1" />
          <rect x="20" y="8" width="3" height="8" rx="1" />
          {/* left clip tab */}
          <rect x="7" y="2" width="2.5" height="4" rx="0.5" />
          {/* right clip tab */}
          <rect x="14.5" y="2" width="2.5" height="4" rx="0.5" />
          {/* arch handle between clips */}
          <path d="M9.5 2.5A2.5 2.5 0 0 1 14.5 2.5" />
          {/* front pocket */}
          <rect x="6" y="15" width="12" height="5" rx="1.5" />
          <path d="M8 18h8" />
        </svg>
      ),
    },
    {
      label: "C",
      desc: "Clips + buckle straps + pocket (closest to reference)",
      svg: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
          {/* body */}
          <rect x="4" y="5" width="16" height="16" rx="2" />
          {/* side strap pads */}
          <rect x="1" y="8" width="3" height="8" rx="1" />
          <rect x="20" y="8" width="3" height="8" rx="1" />
          {/* left clip tab */}
          <rect x="7" y="2" width="2.5" height="4" rx="0.5" />
          {/* right clip tab */}
          <rect x="14.5" y="2" width="2.5" height="4" rx="0.5" />
          {/* arch handle */}
          <path d="M9.5 2.5A2.5 2.5 0 0 1 14.5 2.5" />
          {/* left buckle strap */}
          <rect x="8" y="7" width="2.5" height="5.5" rx="0.5" />
          <path d="M8 10h2.5" />
          {/* right buckle strap */}
          <rect x="13.5" y="7" width="2.5" height="5.5" rx="0.5" />
          <path d="M13.5 10h2.5" />
          {/* front pocket */}
          <rect x="5.5" y="14.5" width="13" height="5.5" rx="1.5" />
          <path d="M8 17.5h8" />
        </svg>
      ),
    },
    {
      label: "D",
      desc: "Taller pack — clips + pads + deep pocket",
      svg: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
          {/* body — slightly taller */}
          <rect x="4.5" y="4" width="15" height="17" rx="2" />
          {/* side strap pads */}
          <rect x="1.5" y="7" width="3" height="9" rx="1" />
          <rect x="19.5" y="7" width="3" height="9" rx="1" />
          {/* left clip tab */}
          <rect x="7.5" y="1.5" width="2" height="3.5" rx="0.5" />
          {/* right clip tab */}
          <rect x="14.5" y="1.5" width="2" height="3.5" rx="0.5" />
          {/* arch handle */}
          <path d="M9.5 2A2.5 2.5 0 0 1 14.5 2" />
          {/* front pocket with buckle strap */}
          <rect x="6" y="14" width="12" height="6" rx="1.5" />
          <path d="M8.5 17h7" />
          {/* single center buckle strap */}
          <rect x="10.5" y="7" width="3" height="5.5" rx="0.5" />
          <path d="M10.5 9.5h3" />
        </svg>
      ),
    },
  ];

  return (
    <div style={{ padding: 40, background: "#f5f3ef", minHeight: "100vh" }}>
      <p style={{ fontFamily: "monospace", fontSize: 11, marginBottom: 8, opacity: 0.5, letterSpacing: "0.08em" }}>
        PACK ICON — FRONT VIEW
      </p>
      <p style={{ fontFamily: "monospace", fontSize: 10, marginBottom: 32, opacity: 0.4 }}>
        Each shown at 48px (large), 32px (card), and 20px (nav)
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 560 }}>
        {opts.map((o) => (
          <div
            key={o.label}
            style={{
              background: "white",
              border: "0.5px solid #ddd",
              borderRadius: 12,
              padding: "16px 20px",
              display: "flex",
              alignItems: "center",
              gap: 20,
            }}
          >
            {/* 48px */}
            <div style={{ color: "#1a1a1a" }}>{o.svg}</div>
            {/* 32px */}
            <div style={{ color: "#1a1a1a" }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
                {extractPaths(o.label)}
              </svg>
            </div>
            {/* 20px nav size */}
            <div style={{ color: "#1a1a1a" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
                {extractPaths(o.label)}
              </svg>
            </div>
            <div>
              <div style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 600 }}>{o.label}</div>
              <div style={{ fontFamily: "monospace", fontSize: 10, opacity: 0.5, marginTop: 2 }}>{o.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function extractPaths(label: string) {
  switch (label) {
    case "A": return <>
      <rect x="4" y="5" width="16" height="16" rx="2" />
      <rect x="1" y="8" width="3" height="8" rx="1" />
      <rect x="20" y="8" width="3" height="8" rx="1" />
      <path d="M9 5A3 3 0 0 1 15 5" />
      <rect x="6" y="15" width="12" height="5" rx="1.5" />
      <path d="M8 18h8" />
    </>;
    case "B": return <>
      <rect x="4" y="5" width="16" height="16" rx="2" />
      <rect x="1" y="8" width="3" height="8" rx="1" />
      <rect x="20" y="8" width="3" height="8" rx="1" />
      <rect x="7" y="2" width="2.5" height="4" rx="0.5" />
      <rect x="14.5" y="2" width="2.5" height="4" rx="0.5" />
      <path d="M9.5 2.5A2.5 2.5 0 0 1 14.5 2.5" />
      <rect x="6" y="15" width="12" height="5" rx="1.5" />
      <path d="M8 18h8" />
    </>;
    case "C": return <>
      <rect x="4" y="5" width="16" height="16" rx="2" />
      <rect x="1" y="8" width="3" height="8" rx="1" />
      <rect x="20" y="8" width="3" height="8" rx="1" />
      <rect x="7" y="2" width="2.5" height="4" rx="0.5" />
      <rect x="14.5" y="2" width="2.5" height="4" rx="0.5" />
      <path d="M9.5 2.5A2.5 2.5 0 0 1 14.5 2.5" />
      <rect x="8" y="7" width="2.5" height="5.5" rx="0.5" />
      <path d="M8 10h2.5" />
      <rect x="13.5" y="7" width="2.5" height="5.5" rx="0.5" />
      <path d="M13.5 10h2.5" />
      <rect x="5.5" y="14.5" width="13" height="5.5" rx="1.5" />
      <path d="M8 17.5h8" />
    </>;
    case "D": return <>
      <rect x="4.5" y="4" width="15" height="17" rx="2" />
      <rect x="1.5" y="7" width="3" height="9" rx="1" />
      <rect x="19.5" y="7" width="3" height="9" rx="1" />
      <rect x="7.5" y="1.5" width="2" height="3.5" rx="0.5" />
      <rect x="14.5" y="1.5" width="2" height="3.5" rx="0.5" />
      <path d="M9.5 2A2.5 2.5 0 0 1 14.5 2" />
      <rect x="6" y="14" width="12" height="6" rx="1.5" />
      <path d="M8.5 17h7" />
      <rect x="10.5" y="7" width="3" height="5.5" rx="0.5" />
      <path d="M10.5 9.5h3" />
    </>;
    default: return null;
  }
}
