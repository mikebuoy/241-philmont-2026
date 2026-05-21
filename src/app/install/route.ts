import { readFile } from "fs/promises";
import { join } from "path";

export async function GET() {
  const file = await readFile(
    join(process.cwd(), "public/philmont-2026.mobileconfig"),
  );
  return new Response(file, {
    headers: {
      "Content-Type": "application/x-apple-aspen-config",
      "Content-Disposition": 'attachment; filename="philmont-2026.mobileconfig"',
    },
  });
}
