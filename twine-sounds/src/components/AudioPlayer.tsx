'use client';

import { useRef, useState } from 'react';
import { PauseIcon, PlayIcon } from '@heroicons/react/24/solid';

interface AudioPlayerProps {
  src: string;
  title?: string;
}

export default function AudioPlayer({ src, title }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  const toggle = () => {
    const el = audioRef.current;
    if (!el) return;
    if (playing) {
      el.pause();
      setPlaying(false);
    } else {
      el.play();
      setPlaying(true);
    }
  };

  return (
    <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
      <button onClick={toggle} className="h-10 w-10 rounded-full bg-brand-orange text-white flex items-center justify-center">
        {playing ? <PauseIcon className="h-5 w-5" /> : <PlayIcon className="h-5 w-5" />}
      </button>
      <div className="flex-1">
        {title && <div className="text-sm font-medium text-brand-dark">{title}</div>}
        <div className="text-xs text-gray-500">MP3 preview</div>
      </div>
      <audio ref={audioRef} src={src} onEnded={() => setPlaying(false)} className="hidden" preload="none" />
    </div>
  );
}