import { generateOgImage } from "../../_og/generateOgImage";

export const alt = "Cooking Reference — Tooth of Time Trek 12-23";
export const size = { width: 1280, height: 500 };
export const contentType = "image/png";

export default function OgImage() {
  return generateOgImage({
    section: "reference",
    sectionLabel: "REFERENCE",
    title: "Cooking",
    subtitle: "Hybrid cook system · 7-step method",
  });
}
