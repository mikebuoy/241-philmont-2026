"use client";

import { useEffect, useState } from "react";
import { SignInSheet } from "./SignInSheet";

export function SignInSheetClient({
  nextUrl,
  heading,
  body,
}: {
  nextUrl: string;
  heading?: string;
  body?: string;
}) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), 2000);
    return () => clearTimeout(t);
  }, []);
  if (!show) return null;
  return <SignInSheet nextUrl={nextUrl} onDismiss={() => setShow(false)} heading={heading} body={body} />;
}
