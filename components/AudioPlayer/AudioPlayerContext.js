import React, { createContext, useContext, useRef, useState, useEffect } from 'react';
import AudioPlayer from './AudioPlayer';
import { Audio } from 'expo-av';

export const AudioPlayerContext = createContext();

export const useAudioPlayer = () => useContext(AudioPlayerContext);

export const AudioPlayerProvider = ({ children }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentUrl, setCurrentUrl] = useState('');
    const [visible, setVisible] = useState(false);
    const audioRef = useRef(new Audio.Sound());

    useEffect(() => {
        if (isPlaying) {
            setVisible(true); // Показывается плеер при воспроизведении
        }
    }, [isPlaying]);

    // Функция для воспроизведения аудио
    const play = async (url) => {
        const { sound } = await Audio.Sound.createAsync({ uri: url }, { shouldPlay: true });

        audioRef.current = sound;
        setIsPlaying(true);
        setCurrentUrl(url);

        sound.setOnPlaybackStatusUpdate((status) => {
            if (status.didJustFinish) {
                handleEnded();
            }
        });
    };

    // Функция для приостановки воспроизведения
    const pause = async () => {
        const sound = audioRef.current;
        await sound.pauseAsync();
        setIsPlaying(false);
    };

    // Функция для остановки воспроизведения и сброса стейта
    const stop = async () => {
        const sound = audioRef.current;
        await sound.stopAsync();
        setIsPlaying(false);
        setCurrentUrl('');
        setVisible(false);
    };

    const handleEnded = async () => {
        setIsPlaying(false);
        await soundRef.current.setPositionAsync(0);
    };

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
            {/*<AudioPlayer />*/}
        </AudioPlayerContext.Provider>
    );
};
