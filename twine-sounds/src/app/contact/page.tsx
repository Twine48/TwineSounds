import Link from 'next/link';

export default function ContactPage() {
  return (
    <div className="container py-14">
      <div className="text-center">
        <div className="badge inline-block">Let’s Talk</div>
        <h1 className="mt-3 text-3xl font-bold">Contact</h1>
        <p className="mt-2 text-gray-600">Reach us for bookings, quotes, and collaborations.</p>
      </div>
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <div className="card p-6">
          <div className="text-lg font-semibold">Contact Info</div>
          <ul className="mt-3 space-y-2 text-sm text-gray-700">
            <li>Email: <Link className="text-brand-orange" href="mailto:twinesounds@gmail.com">twinesounds@gmail.com</Link></li>
            <li>Phone: <Link className="text-brand-orange" href="tel:+256740929848">+256 740 929 848</Link> / <Link className="text-brand-orange" href="tel:+256776803262">+256 776 803 262</Link></li>
            <li>WhatsApp: <Link className="text-brand-orange" href="https://wa.me/256776803262" target="_blank">+256 776 803 262</Link></li>
            <li>Address: Mukono, Uganda</li>
          </ul>
          <div className="mt-4 flex gap-4 text-sm">
            <Link href="https://www.tiktok.com/@twine.sounds" className="hover:text-brand-orange" target="_blank" rel="noreferrer">TikTok</Link>
            <Link href="https://x.com/twinemugabe" className="hover:text-brand-orange" target="_blank" rel="noreferrer">X</Link>
            <Link href="https://www.linkedin.com/in/augustus-twinemugabe-aa033a212" className="hover:text-brand-orange" target="_blank" rel="noreferrer">LinkedIn</Link>
            <Link href="https://www.instagram.com/twine__sounds" className="hover:text-brand-orange" target="_blank" rel="noreferrer">Instagram</Link>
          </div>
        </div>
        <div className="card p-6">
          <div className="text-lg font-semibold">Book a Call</div>
          <p className="mt-2 text-sm text-gray-600">Tell us about your project and we’ll get back within 24 hours.</p>
          <a href="/get-a-quote" className="btn btn-primary mt-4 w-fit">Request a Quote</a>
        </div>
      </div>
    </div>
  );
}