import { generateOgImage } from "../../_og/generateOgImage";

export const alt = "In Camp — Tooth of Time Trek 12-23";
export const size = { width: 1280, height: 500 };
export const contentType = "image/png";

export default function OgImage() {
  return generateOgImage({
    section: "reference",
    sectionLabel: "REFERENCE",
    title: "In Camp",
    subtitle: "Morning sequence · campsite setup · cook · bear bag",
  });
}
