import { generateOgImage } from "@/app/_og/generateOgImage";

export const runtime = "edge";
export const alt = "Crew Gear";
export const size = { width: 1280, height: 500 };
export const contentType = "image/png";

export default function OGImage() {
  return generateOgImage({
    section: "crew",
    sectionLabel: "My Crew",
    title: "Crew Gear",
  });
}
