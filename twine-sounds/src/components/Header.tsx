'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Bars3Icon } from '@heroicons/react/24/outline';
import { useState } from 'react';

const nav = [
  { href: '/voice-artists', label: 'Voice Artists' },
  { href: '/services', label: 'Services' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' }
];

export default function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="border-b border-gray-100 bg-white/90 backdrop-blur sticky top-0 z-40">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo.svg" alt="Twine Sounds" width={48} height={48} />
          <span className="font-bold text-xl tracking-tight">Twine Sounds</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          {nav.map(item => (
            <Link key={item.href} href={item.href} className="text-sm text-brand-navy hover:text-brand-orange">
              {item.label}
            </Link>
          ))}
          <Link href="/get-a-quote" className="btn btn-primary text-sm">Get a Quote</Link>
        </nav>
        <button onClick={() => setOpen(!open)} className="md:hidden p-2 rounded hover:bg-gray-50">
          <Bars3Icon className="h-6 w-6 text-brand-dark" />
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <div className="container py-3 flex flex-col gap-3">
            {nav.map(item => (
              <Link key={item.href} href={item.href} className="text-sm text-brand-navy">
                {item.label}
              </Link>
            ))}
            <Link href="/get-a-quote" className="btn btn-primary text-sm w-full text-center">Get a Quote</Link>
          </div>
        </div>
      )}
    </header>
  );
}