import { useState, useEffect } from 'react';

export interface Reading {
  id: string;
  mood: string;
  dateOfBirth: string;
  zodiacSign: string;
  lifePathNumber: number;
  insight: {
    moodInsight: string;
    advice: string;
    todaysAction: string;
  };
  createdAt: string;
}

const STORAGE_KEY = 'cosmic_reading_history';

export const useReadingHistory = () => {
  const [readings, setReadings] = useState<Reading[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setReadings(JSON.parse(stored));
      } catch {
        setReadings([]);
      }
    }
  }, []);

  const saveReading = (reading: Omit<Reading, 'id' | 'createdAt'>) => {
    const newReading: Reading = {
      ...reading,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    
    const updated = [newReading, ...readings].slice(0, 50); // Keep last 50 readings
    setReadings(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newReading;
  };

  const clearHistory = () => {
    setReadings([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return { readings, saveReading, clearHistory };
};
