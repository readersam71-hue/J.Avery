"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Phone, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

const navLinks = [
  { name: "Emergency Plumbing", href: "/services/emergency-plumbing" },
  { name: "Bathrooms", href: "/services/bathroom-transformations" },
  { name: "Boiler Service", href: "/services/boiler-servicing-repair" },
  { name: "Kitchens", href: "/services/kitchen-plumbing" },
  { name: "Areas", href: "/#areas" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex flex-col">
            <span className="text-2xl font-extrabold text-blue-900 leading-tight">J.AVERY</span>
            <span className="text-xs font-bold text-slate-500 tracking-widest uppercase">Plumbing & Heating</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-slate-600 hover:text-blue-900 font-semibold transition-colors"
              >
                {link.name}
              </Link>
            ))}
            <div className="flex items-center gap-4 ml-4">
              <a href="tel:0121XXXXXXX" className="flex items-center gap-2 text-blue-900 font-bold">
                <Phone className="w-5 h-5" />
                0121 XXX XXXX
              </a>
              <Link href="/quote">
                <Button variant="emergency" size="sm">Get a Quote</Button>
              </Link>
            </div>
          </div>

          {/* Mobile Toggle */}
          <button className="lg:hidden p-2 text-slate-600" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="lg:hidden bg-white border-t p-4 space-y-4 shadow-xl">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="block py-2 text-lg font-semibold text-slate-700"
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-4 space-y-4 border-t">
            <a href="tel:0121XXXXXXX" className="flex items-center justify-center gap-2 text-blue-900 font-bold py-3 border-2 border-blue-900 rounded-lg">
              <Phone className="w-5 h-5" />
              Call 0121 XXX XXXX
            </a>
            <Link href="/quote" onClick={() => setIsOpen(false)}>
              <Button variant="emergency" className="w-full py-4 text-lg">Get a Quote</Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
