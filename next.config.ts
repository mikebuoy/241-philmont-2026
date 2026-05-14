import type { NextConfig } from "next";
import { execSync } from "child_process";

function getCommitSha(): string {
  // Vercel sets this in their build environment
  if (process.env.VERCEL_GIT_COMMIT_SHA) {
    return process.env.VERCEL_GIT_COMMIT_SHA.substring(0, 7);
  }
  // Local dev / other CI
  try {
    return execSync("git rev-parse --short HEAD").toString().trim();
  } catch {
    return "dev";
  }
}

function getBuildDate(): string {
  return new Date().toISOString().split("T")[0];
}

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_BUILD_SHA: getCommitSha(),
    NEXT_PUBLIC_BUILD_DATE: getBuildDate(),
  },
};

export default nextConfig;
