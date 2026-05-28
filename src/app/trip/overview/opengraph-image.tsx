import { generateOgImage } from "../../_og/generateOgImage";

export const alt = "Trek Overview — Tooth of Time Trek 12-23";
export const size = { width: 1280, height: 500 };
export const contentType = "image/png";

export default function OgImage() {
  return generateOgImage({
    section: "trip",
    sectionLabel: "MY TRIP",
    title: "Trek",
    subtitle: "Crew roles · Arrowhead · Medical · Logistics",
  });
}
