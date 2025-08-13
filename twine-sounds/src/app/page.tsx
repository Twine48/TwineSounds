import Link from 'next/link';
import Image from 'next/image';
import AudioPlayer from '@/components/AudioPlayer';

const samples = [
  { id: 'ad', title: 'Commercial Ad — Energetic', url: 'https://cdn.pixabay.com/download/audio/2021/11/08/audio_1.mp3?filename=energetic-113.wav' },
  { id: 'narration', title: 'Narration — Warm', url: 'https://cdn.pixabay.com/download/audio/2021/11/08/audio_2.mp3?filename=warm-voice-114.wav' },
  { id: 'podcast', title: 'Podcast Intro — Bold', url: 'https://cdn.pixabay.com/download/audio/2021/11/08/audio_3.mp3?filename=podcast-intro-115.wav' }
];

export default function HomePage() {
  return (
    <div>
      <section className="bg-brand-dark text-white">
        <div className="container py-20 grid gap-12 md:grid-cols-2 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">Sound that moves people. Audio that builds brands.</h1>
            <p className="mt-4 text-white/80 text-lg">Twine Sounds is a full creative audio agency. Voice overs, jingles, ads, podcasts, and sonic branding for ambitious teams.</p>
            <div className="mt-8 flex gap-4">
              <Link href="/get-a-quote" className="btn btn-primary">Request a Quote</Link>
              <Link href="/portfolio" className="btn btn-outline text-white border-white hover:bg-white hover:text-brand-dark">Hear Our Work</Link>
            </div>
          </div>
          <div className="relative">
            <Image src="/hero-mic.svg" alt="Microphone" width={520} height={420} className="mx-auto" />
          </div>
        </div>
      </section>

      <section className="container py-16">
        <div className="text-center">
          <div className="badge inline-block">Featured Samples</div>
          <h2 className="mt-3 text-2xl font-bold">Find a voice that fits your story</h2>
          <p className="mt-2 text-gray-600">English, Luganda, and more local languages. Commercial, narration, animation, and beyond.</p>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {samples.map(s => (
            <div key={s.id} className="card p-5">
              <div className="font-semibold">{s.title}</div>
              <div className="mt-3">
                <AudioPlayer src={s.url} title={s.title} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-brand-light py-14">
        <div className="container grid gap-6 md:grid-cols-3">
          <div className="card p-6">
            <div className="text-lg font-semibold">Voice Overs</div>
            <p className="mt-2 text-sm text-gray-600">Ads, explainers, e-learning, IVR, and more — in multiple languages and styles.</p>
          </div>
          <div className="card p-6">
            <div className="text-lg font-semibold">Audio Production</div>
            <p className="mt-2 text-sm text-gray-600">Jingles, sonic logos, podcast editing, and full post-production.</p>
          </div>
          <div className="card p-6">
            <div className="text-lg font-semibold">Script & Creative</div>
            <p className="mt-2 text-sm text-gray-600">Scripting, casting, direction — we shape the message and the sound.</p>
          </div>
        </div>
      </section>
    </div>
  );
}