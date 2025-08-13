export default function ServicesPage() {
  return (
    <div className="container py-14">
      <div className="text-center">
        <div className="badge inline-block">What We Do</div>
        <h1 className="mt-3 text-3xl font-bold">Services</h1>
        <p className="mt-2 text-gray-600">From script to final mix — full-service audio for brands and agencies.</p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <div className="card p-6">
          <div className="text-lg font-semibold">Voice Overs</div>
          <p className="mt-2 text-sm text-gray-600">Commercials, explainers, e-learning, IVR, narration, animation, trailers, and corporate videos.</p>
        </div>
        <div className="card p-6">
          <div className="text-lg font-semibold">Audio Production</div>
          <p className="mt-2 text-sm text-gray-600">Jingles, sonic logos, music beds, ad mixes, radio imaging, and sound design.</p>
        </div>
        <div className="card p-6">
          <div className="text-lg font-semibold">Script Writing</div>
          <p className="mt-2 text-sm text-gray-600">Concepting, scripting, localization, and creative direction to deliver messages that land.</p>
        </div>
        <div className="card p-6">
          <div className="text-lg font-semibold">Podcast Production</div>
          <p className="mt-2 text-sm text-gray-600">Editing, mixing, mastering, and show packaging from intro to outro.</p>
        </div>
      </div>

      <div className="mt-12 text-center">
        <a href="/get-a-quote" className="btn btn-primary">Request a Quote</a>
      </div>
    </div>
  );
}