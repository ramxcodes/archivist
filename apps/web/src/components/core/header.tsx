"use client";
import Link from "next/link";

import { ModeToggle } from "./mode-toggle";
import UserMenu from "./user-menu";

export default function Header() {
  const links = [{ to: "/", label: "Home" }] as const;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-row items-center justify-between px-2 py-1 mt-4 border rounded-lg max-w-5xl">
        <nav className="flex gap-4 text-lg font-medium">
          {links.map(({ to, label }) => {
            return (
              <Link key={to} href={to}>
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <ModeToggle />
          <UserMenu />
        </div>
      </div>
    </div>
  );
}
