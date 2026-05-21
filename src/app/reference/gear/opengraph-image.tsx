import { generateOgImage } from "../../_og/generateOgImage";

export const alt = "Gear Reference — Tooth of Time Trek 12-23";
export const size = { width: 1280, height: 500 };
export const contentType = "image/png";

export default function OgImage() {
  return generateOgImage({
    section: "reference",
    sectionLabel: "REFERENCE",
    title: "Gear",
    subtitle: "Crew gear · shelter · weight assignment",
  });
}
