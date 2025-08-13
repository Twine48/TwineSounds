import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-gray-100 bg-brand-light/60">
      <div className="container py-10 grid gap-8 md:grid-cols-3">
        <div>
          <div className="font-bold text-lg">Twine Sounds</div>
          <p className="mt-2 text-sm text-gray-600">Creative audio agency based in Mukono, Uganda.</p>
          <p className="mt-2 text-sm text-gray-600">Email: <Link className="text-brand-orange" href="mailto:twinesounds@gmail.com">twinesounds@gmail.com</Link></p>
          <p className="mt-1 text-sm text-gray-600">Contacts: <Link className="text-brand-orange" href="tel:+256740929848">+256 740 929 848</Link> / <Link className="text-brand-orange" href="tel:+256776803262">+256 776 803 262</Link></p>
          <p className="mt-1 text-sm text-gray-600">Address: Mukono, Uganda</p>
        </div>
        <div>
          <div className="font-semibold">Quick Links</div>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/services" className="hover:text-brand-orange">Services</Link></li>
            <li><Link href="/voice-artists" className="hover:text-brand-orange">Voice Artists</Link></li>
            <li><Link href="/portfolio" className="hover:text-brand-orange">Portfolio</Link></li>
            <li><Link href="/get-a-quote" className="hover:text-brand-orange">Get a Quote</Link></li>
          </ul>
        </div>
        <div>
          <div className="font-semibold">Follow</div>
          <div className="mt-3 flex gap-4 text-sm">
            <Link href="https://www.tiktok.com/@twine.sounds" className="hover:text-brand-orange" target="_blank" rel="noreferrer">TikTok</Link>
            <Link href="https://x.com/twinemugabe" className="hover:text-brand-orange" target="_blank" rel="noreferrer">X</Link>
            <Link href="https://www.linkedin.com/in/augustus-twinemugabe-aa033a212" className="hover:text-brand-orange" target="_blank" rel="noreferrer">LinkedIn</Link>
            <Link href="https://www.instagram.com/twine__sounds" className="hover:text-brand-orange" target="_blank" rel="noreferrer">Instagram</Link>
          </div>
          <div className="mt-4">
            <Link href="https://wa.me/256776803262" className="btn btn-outline text-sm">WhatsApp Us</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-100 py-4 text-center text-xs text-gray-500">© {new Date().getFullYear()} Twine Sounds. All rights reserved.</div>
    </footer>
  );
}