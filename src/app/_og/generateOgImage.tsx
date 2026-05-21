import fs from "fs";
import path from "path";
import { ImageResponse } from "next/og";

function getBlankBase64(): string {
  const filePath = path.join(process.cwd(), "src/app/_og/blank.png");
  const buf = fs.readFileSync(filePath);
  return `data:image/png;base64,${buf.toString("base64")}`;
}

export function generateOgImage({
  sectionLabel,
  title,
  subtitle,
}: {
  section: "home" | "trip" | "pack" | "crew" | "reference";
  sectionLabel: string;
  title: string;
  subtitle?: string;
}): ImageResponse {
  const bgSrc = getBlankBase64();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
        }}
      >
        {/* Topographic background */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={bgSrc}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          alt=""
        />

        {/* Text overlay — left half, vertically centered, above bottom branding */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 80,
            width: "60%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "0 0 0 64px",
            gap: "0px",
          }}
        >
          {/* Section eyebrow */}
          <div
            style={{
              fontSize: "16px",
              fontWeight: 600,
              letterSpacing: "0.1em",
              color: "#2d5a8a",
              textTransform: "uppercase",
              marginBottom: "18px",
              fontFamily: "ui-monospace, monospace",
            }}
          >
            {sectionLabel}
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: "72px",
              fontWeight: 800,
              color: "#1a2e44",
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              marginBottom: subtitle ? "18px" : "0",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            {title}
          </div>

          {/* Subtitle */}
          {subtitle && (
            <div
              style={{
                fontSize: "22px",
                color: "#666666",
                fontWeight: 400,
                lineHeight: 1.4,
                fontFamily: "system-ui, sans-serif",
              }}
            >
              {subtitle}
            </div>
          )}
        </div>
      </div>
    ),
    { width: 1280, height: 500 },
  );
}
