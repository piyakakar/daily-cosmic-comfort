import { useState, useEffect, useRef, useCallback } from 'react';

// Peaceful cosmic ambient music - royalty-free space meditation music
const COSMIC_MUSIC_URL = 'https://assets.mixkit.co/music/preview/mixkit-serene-view-443.mp3';

export const useBackgroundMusic = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(COSMIC_MUSIC_URL);
    audio.loop = true;
    audio.volume = volume;
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

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const toggleMusic = useCallback(async () => {
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
  }, [isPlaying]);

  const adjustVolume = useCallback((newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolume(clampedVolume);
  }, []);

  const increaseVolume = useCallback(() => {
    adjustVolume(volume + 0.1);
  }, [volume, adjustVolume]);

  const decreaseVolume = useCallback(() => {
    adjustVolume(volume - 0.1);
  }, [volume, adjustVolume]);

  return { 
    isPlaying, 
    isLoaded, 
    volume,
    toggleMusic, 
    adjustVolume,
    increaseVolume,
    decreaseVolume
  };
};
