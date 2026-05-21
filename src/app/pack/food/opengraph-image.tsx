import { generateOgImage } from "../../_og/generateOgImage";

export const alt = "Food & Water — Tooth of Time Trek 12-23";
export const size = { width: 1280, height: 500 };
export const contentType = "image/png";

export default function OgImage() {
  return generateOgImage({
    section: "pack",
    sectionLabel: "MY PACK",
    title: "Food & Water",
    subtitle: "Resupply · dry camps · hydration",
  });
}
