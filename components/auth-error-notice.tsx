"use client";
import { useEffect, useState } from "react";

/** Shown after a failed Google round-trip (/?auth=error). Read in the browser so the page stays static. */
export function AuthErrorNotice() {
  const [show, setShow] = useState(false);
  useEffect(() => setShow(new URLSearchParams(window.location.search).get("auth") === "error"), []);
  return show ? (
    <p role="alert" className="alert">
      Sign-in didn&apos;t complete. Please try again.
    </p>
  ) : null;
}
