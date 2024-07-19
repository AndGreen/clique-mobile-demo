import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

export const AudioPlayer = ({ useAudioPlayer }) => {
    const { audioRef, isPlaying, play, pause, stop, currentUrl, visible } = useAudioPlayer();
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    useEffect(() => {
        const updateTime = () => {
            if (audioRef.current) {
                audioRef.current.getStatusAsync().then((status) => {
                    if (status.isLoaded) {
                        setCurrentTime(status.positionMillis / 1000);
                        setDuration(status.durationMillis / 1000);
                    }
                });
            }
        };

        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, [audioRef]); // Зависимость от audioRef для правильной регистрации/удаления событий

    const handleClose = () => {
        stop();
    };

    const handleProgressClick = async (event) => {
        const { locationX } = event.nativeEvent;
        const progressBarWidth = event.currentTarget.offsetWidth;
        const newTime = (locationX / progressBarWidth) * duration;
        if (audioRef.current) {
            await audioRef.current.setPositionAsync(newTime * 1000);
        }
    };

    const progressPercentage = (currentTime / duration) * 100;

    return (
        <View
            className={`hidden fixed z-50 bottom-0 left-0 right-0 p-4 mb-2 mx-2 text-white rounded-full bg-slate-200 border-2 border-rose-600 transition-transform duration-500 ${
                visible ? 'translate-y-0' : 'translate-y-full'
            }`}>
            <View className="flex items-center">
                <View
                    onClick={() => (isPlaying ? pause() : play(currentUrl))}
                    className=" mr-2 h-10 w-10 flex items-center justify-center rounded-full bg-rose-600 p-2 text-white">
                    {!isPlaying && (
                        <Svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="w-4 h-4 -mr-px ">
                            <Path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"
                            />
                        </Svg>
                    )}
                    {isPlaying && (
                        <Svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="w-4 h-4">
                            <Path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15.75 5.25v13.5m-7.5-13.5v13.5"
                            />
                        </Svg>
                    )}
                </View>
                <View className="flex-1 mr-2 relative">
                    <View
                        className="w-full bg-slate-400 h-2 cursor-pointer rounded-full"
                        onClick={handleProgressClick}>
                        <View
                            style={{ width: `${progressPercentage}%` }}
                            className="bg-rose-600 rounded-full h-2"></View>
                    </View>
                </View>
                <Text className="mx-3 text-slate-600 text-sm">
                    {Math.floor(currentTime)} / {Math.floor(duration)} Сек
                </Text>
                <View
                    type="button"
                    onClick={handleClose}
                    className="bg-rose-600 rounded-full p-2 inline-flex items-center justify-center text-white">
                    <Svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5">
                        <Path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </Svg>
                </View>
            </View>
        </View>
    );
};

export default AudioPlayer;
