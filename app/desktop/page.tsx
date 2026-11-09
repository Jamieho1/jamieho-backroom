import { redirect } from "next/navigation";
import { APP_PATHS, practiceHref } from "@/lib/desktop-pages";
/** Keep old bookmarks usable without rendering a separate desktop. */
export default async function DesktopRedirect({ searchParams }: { searchParams: Promise<{app?:string;problem?:string}> }) {
  const { app, problem } = await searchParams;
  if (app && APP_PATHS[app]) redirect(app === "practice" ? practiceHref(problem) : APP_PATHS[app]);
  redirect("/resources");
}
