export default function AboutPage() {
  return (
    <div className="container py-14">
      <div className="text-center">
        <div className="badge inline-block">Who We Are</div>
        <h1 className="mt-3 text-3xl font-bold">About Twine Sounds</h1>
        <p className="mt-2 text-gray-600">Born in Uganda. Built for the world. We craft sound that helps brands be heard.</p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <div className="card p-6">
          <div className="text-lg font-semibold">Our Story</div>
          <p className="mt-2 text-sm text-gray-600">Twine Sounds began with a microphone and a belief that audio can move people to action. Today, we are a networked creative audio studio serving startups, NGOs, and agencies with fast, high-quality production.</p>
        </div>
        <div className="card p-6">
          <div className="text-lg font-semibold">Mission</div>
          <p className="mt-2 text-sm text-gray-600">To help African and global brands communicate clearly and memorably through audio.</p>
        </div>
        <div className="card p-6">
          <div className="text-lg font-semibold">Vision</div>
          <p className="mt-2 text-sm text-gray-600">A leading digital-first audio partner in East Africa, powering campaigns heard worldwide.</p>
        </div>
        <div className="card p-6">
          <div className="text-lg font-semibold">Motto</div>
          <p className="mt-2 text-sm text-gray-600">Say it well. Sound unforgettable.</p>
        </div>
      </div>
    </div>
  );
}
