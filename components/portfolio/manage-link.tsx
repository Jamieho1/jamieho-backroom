"use client";
import Link from "next/link";
import { useViewer } from "@/components/viewer-provider";

/** TKT-86: "Manage projects" on /projects and "Edit project" on a project page, shown to the owner only. */
export function ProjectManageLink({ slug }: { slug?: string }) {
  const { viewer } = useViewer();
  if (viewer.status !== "owner") return null;
  return <Link className="btn ghost small" prefetch={false} href={slug ? `/projects/manage?edit=${encodeURIComponent(slug)}` : "/projects/manage"}>{slug ? "Edit project" : "Manage projects"}</Link>;
}
