import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Philmont Trek Hub",
    short_name: "Philmont",
    description:
      "Trek planning and pack-weight management. BSA Troop 241 · Trek 12-28 · 2026.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f5f1e8",
    theme_color: "#1e4d6b",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
