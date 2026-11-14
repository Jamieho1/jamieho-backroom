"use client";
import {usePathname} from "next/navigation";
import { SiteNavigation } from "./site-navigation";
export function SiteHeader() { const path=usePathname();if(path==="/interview"||path.startsWith("/interview/"))return null;return <div className="site-header"><SiteNavigation /></div>; }
