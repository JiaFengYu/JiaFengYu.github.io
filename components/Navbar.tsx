"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { assetPath } from "../lib/site";

const items = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Work" },
  { href: "/blog", label: "Writing" },
  { href: "/about", label: "About" },
  { href: "/gimps", label: "GIMPS" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const links = items.map(({ href, label }) => (
    <Link key={href} href={href} onClick={() => setOpen(false)}
      aria-current={(href === "/" ? pathname === href : pathname.startsWith(href)) ? "page" : undefined}
      className="navbar-link rounded px-2 py-2 font-medium aria-[current=page]:bg-indigo-100">{label}</Link>
  ));
  return (
    <nav aria-label="Main navigation" className="navbar-override shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-xl font-bold navbar-link" onClick={() => setOpen(false)}>Jayden Yu</Link>
          <div className="hidden md:flex items-center gap-3">{links}<a href={assetPath("/resume.pdf")} target="_blank" rel="noopener noreferrer" className="navbar-link px-2 py-2">Résumé ↗</a></div>
          <button type="button" className="md:hidden p-2 text-gray-900" aria-expanded={open} aria-controls="mobile-navigation" aria-label={open ? "Close navigation" : "Open navigation"} onClick={() => setOpen(!open)} onKeyDown={event => { if (event.key === "Escape") setOpen(false); }}>{open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}</button>
        </div>
        {open && <div id="mobile-navigation" className="md:hidden flex flex-col gap-1 border-t border-gray-200 mt-4 pt-4" onKeyDown={event => { if (event.key === "Escape") setOpen(false); }}>{links}<a href={assetPath("/resume.pdf")} target="_blank" rel="noopener noreferrer" className="navbar-link px-2 py-2" onClick={() => setOpen(false)}>Résumé ↗</a></div>}
      </div>
    </nav>
  );
}
