import { useState, useEffect, useRef } from 'react';

// Using a royalty-free ambient space music URL
const AMBIENT_MUSIC_URL = 'https://assets.mixkit.co/music/preview/mixkit-dreaming-big-31.mp3';

export const useBackgroundMusic = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(AMBIENT_MUSIC_URL);
    audio.loop = true;
    audio.volume = 0.3;
    audio.preload = 'auto';
    
    audio.addEventListener('canplaythrough', () => {
      setIsLoaded(true);
    });

    audio.addEventListener('error', (e) => {
      console.error('Audio loading error:', e);
    });

    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  const toggleMusic = async () => {
    if (!audioRef.current) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error toggling music:', error);
    }
  };

  return { isPlaying, isLoaded, toggleMusic };
};
