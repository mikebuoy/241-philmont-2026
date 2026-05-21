import { generateOgImage } from "../../_og/generateOgImage";

export const alt = "Altitude & Safety — Tooth of Time Trek 12-23";
export const size = { width: 1280, height: 500 };
export const contentType = "image/png";

export default function OgImage() {
  return generateOgImage({
    section: "reference",
    sectionLabel: "REFERENCE",
    title: "Altitude & Safety",
    subtitle: "AMS symptoms · 12,441 ft peak · critical descents",
  });
}
