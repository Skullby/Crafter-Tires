"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const isActive = href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={[
        "block rounded-xl px-3 py-2.5 text-sm font-medium transition",
        isActive
          ? "bg-orange-500 text-white shadow-sm"
          : "text-slate-300 hover:bg-slate-800 hover:text-white"
      ].join(" ")}
      aria-current={isActive ? "page" : undefined}
    >
      {label}
    </Link>
  );
}
