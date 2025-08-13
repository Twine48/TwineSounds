import AudioPlayer from '@/components/AudioPlayer';

const items = [
  { id: 'p1', title: 'Radio Ad — Retail Promo', url: 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_port1.mp3?filename=radio-ad-1.wav' },
  { id: 'p2', title: 'Explainer Video VO', url: 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_port2.mp3?filename=explainer-vo.wav' },
  { id: 'p3', title: 'Podcast Intro Jingle', url: 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_port3.mp3?filename=podcast-jingle.wav' }
];

export default function PortfolioPage() {
  return (
    <div className="container py-14">
      <div className="text-center">
        <div className="badge inline-block">Selected Work</div>
        <h1 className="mt-3 text-3xl font-bold">Portfolio</h1>
        <p className="mt-2 text-gray-600">A taste of recent projects in advertising, corporate, and podcasting.</p>
      </div>
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {items.map(i => (
          <div key={i.id} className="card p-6">
            <div className="font-semibold">{i.title}</div>
            <div className="mt-3">
              <AudioPlayer src={i.url} title={i.title} />
            </div>
          </div>
        ))}
        <div className="card p-6">
          <div className="font-semibold">Video Case Study</div>
          <div className="mt-3 aspect-video rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-sm">Video Placeholder</div>
        </div>
      </div>
    </div>
  );
}