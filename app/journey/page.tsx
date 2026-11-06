import { redirect } from "next/navigation";

/** Legacy preview URL: the journey now lives at the canonical homepage. */
export default function JourneyRedirect() { redirect("/"); }
