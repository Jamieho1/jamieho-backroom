import { redirect } from "next/navigation";
/** Retired standalone About page; the public introduction lives in the journey. */
export default function AboutRedirect() { redirect("/#pivot"); }
