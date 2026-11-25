import { redirect } from "next/navigation";
import { APP_PATHS } from "@/lib/desktop-pages";
/** Keep old bookmarks usable without rendering a separate desktop. Old notes/practice/behavioral launchers redirect to PassLoop in next.config.ts. */
export default async function DesktopRedirect({ searchParams }: { searchParams: Promise<{app?:string}> }) {
  const { app } = await searchParams;
  if (app && Object.hasOwn(APP_PATHS,app)) redirect(APP_PATHS[app]);
  redirect("/content/guides");
}
