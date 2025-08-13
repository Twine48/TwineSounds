import AudioPlayer from '@/components/AudioPlayer';

type Artist = {
  id: string;
  name: string;
  photo: string;
  languages: string[];
  styles: string[];
  sampleUrl: string;
};

const artists: Artist[] = [
  {
    id: 'a1',
    name: 'John K.',
    photo: '/artists/male-1.jpg',
    languages: ['English'],
    styles: ['Commercial', 'Narration'],
    sampleUrl: 'https://cdn.pixabay.com/download/audio/2021/09/30/audio_a.mp3?filename=male-voice-1.wav'
  },
  {
    id: 'a2',
    name: 'Sarah N.',
    photo: '/artists/female-1.jpg',
    languages: ['English', 'Luganda'],
    styles: ['Explainer', 'E-learning'],
    sampleUrl: 'https://cdn.pixabay.com/download/audio/2021/09/30/audio_b.mp3?filename=female-voice-1.wav'
  },
  {
    id: 'a3',
    name: 'Kato L.',
    photo: '/artists/male-2.jpg',
    languages: ['Luganda'],
    styles: ['Commercial', 'Animation'],
    sampleUrl: 'https://cdn.pixabay.com/download/audio/2021/09/30/audio_c.mp3?filename=male-voice-2.wav'
  }
];

export default function VoiceArtistsPage() {
  return (
    <div className="container py-14">
      <div className="text-center">
        <div className="badge inline-block">Talent Roster</div>
        <h1 className="mt-3 text-3xl font-bold">Voice Artists</h1>
        <p className="mt-2 text-gray-600">English, Luganda, and more. Find the right tone and personality for your project.</p>
      </div>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {artists.map(a => (
          <div key={a.id} className="card overflow-hidden">
            <div className="p-5">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-brand-light" />
                <div>
                  <div className="font-semibold">{a.name}</div>
                  <div className="text-xs text-gray-500">{a.languages.join(', ')}</div>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {a.styles.map(s => (
                  <span key={s} className="badge">{s}</span>
                ))}
              </div>
              <div className="mt-4">
                <AudioPlayer src={a.sampleUrl} title={`${a.name} — sample`} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}