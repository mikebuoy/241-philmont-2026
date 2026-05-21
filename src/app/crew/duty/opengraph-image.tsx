import { generateOgImage } from "../../_og/generateOgImage";

export const alt = "Duty Roster — Tooth of Time Trek 12-23";
export const size = { width: 1280, height: 500 };
export const contentType = "image/png";

export default function OgImage() {
  return generateOgImage({
    section: "crew",
    sectionLabel: "MY CREW",
    title: "Duty Roster",
    subtitle: "Cook · cleanup · water · nav · bear bag",
  });
}
