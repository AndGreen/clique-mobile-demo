import React, { createContext, useContext, useRef, useState, useEffect } from 'react';
import AudioPlayer from './AudioPlayer';

export const AudioPlayerContext = createContext();

export const useAudioPlayer = () => useContext(AudioPlayerContext);

export const AudioPlayerProvider = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');
  const [visible, setVisible] = useState(false);
  const audioRef = useRef(new Audio());

  useEffect(() => {
    if (isPlaying) {
      setVisible(true); // Показывается плеер при воспроизведении
    }
  }, [isPlaying]);

  // Функция для воспроизведения аудио
  const play = url => {
    const audio = audioRef.current;
    if (audio.src !== url) {
      audio.src = url;
      audio.load();
    }
    audio
      .play()
      .then(() => {
        setIsPlaying(true);
        setCurrentUrl(url);
      })
      .catch(error => console.error('Error playing audio:', error));
  };

  // Функция для приостановки воспроизведения
  const pause = () => {
    const audio = audioRef.current;
    audio.pause();
    setIsPlaying(false);
  };

  // Функция для остановки воспроизведения и сброса стейта
  const stop = () => {
    const audio = audioRef.current;
    audio.pause();
    audio.currentTime = 0;
    setIsPlaying(false);
    setCurrentUrl('');
    setVisible(false);
  };

  // Отслеживание окончания воспроизведения трека
  useEffect(() => {
    const audio = audioRef.current;

    const handleEnded = () => {
      setIsPlaying(false);
      // setCurrentUrl(''); // Не сбрасывать url аудио
      audio.currentTime = 0; // Сбросить время на начало
    };

    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const value = {
    isPlaying,
    currentUrl,
    visible,
    audioRef,
    play,
    pause,
    stop,
  };

  return (
    <AudioPlayerContext.Provider value={value}>
      {children}
      <AudioPlayer />
    </AudioPlayerContext.Provider>
  );
};
