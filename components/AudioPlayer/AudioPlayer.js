import React, { useEffect, useState } from "react";
import { useAudioPlayer } from "./AudioPlayerContext";

function AudioPlayer() {
  const {
    audioRef,
    isPlaying,
    play,
    pause,
    stop,
    currentUrl,
    visible,
  } = useAudioPlayer();
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;

    const onLoadedMetadata = () => {
      // Устанавливается продолжительность аудио
      setDuration(audio.duration);
    };

    const onTimeUpdate = () => {
      // Обновляется текущее время воспроизведения
      setCurrentTime(audio.currentTime);
    };

    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("timeupdate", onTimeUpdate);

    return () => {
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("timeupdate", onTimeUpdate);
    };
  }, [audioRef]); // Зависимость от audioRef для правильной регистрации/удаления событий

  const handleClose = () => {
    stop();
  };

  // Функция для изменения положения воспроизведения
  const handleProgressClick = (event) => {
    // Получение ссылки на контейнер прогресс-бара
    const progressBar = event.currentTarget;
    // Вычисление позиции клика относительно начала прогресс-бара
    const newTime =
      ((event.clientX - progressBar.getBoundingClientRect().left) /
        progressBar.offsetWidth) *
      duration;
    audioRef.current.currentTime = newTime;
  };

  const progressPercentage = (currentTime / duration) * 100;

  return (
    <div
      className={`hidden fixed z-50 bottom-0 left-0 right-0 p-4 mb-2 mx-2 text-white rounded-full bg-slate-200 border-2 border-rose-600 transition-transform duration-500 ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="flex items-center">
        <button
          onClick={() => (isPlaying ? pause() : play(currentUrl))}
          className=" mr-2 h-10 w-10 flex items-center justify-center rounded-full bg-rose-600 p-2 text-white"
        >
          {!isPlaying && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-4 h-4 -mr-px "
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"
              />
            </svg>
          )}
          {isPlaying && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 5.25v13.5m-7.5-13.5v13.5"
              />
            </svg>
          )}
        </button>
        <div className="flex-1 mr-2 relative">
          <div
            className="w-full bg-slate-400 h-2 cursor-pointer rounded-full"
            onClick={handleProgressClick}
          >
            <div
              style={{ width: `${progressPercentage}%` }}
              className="bg-rose-600 rounded-full h-2"
            ></div>
          </div>
        </div>
        <span className="mx-3 text-slate-600 text-sm">
          {Math.floor(currentTime)} / {Math.floor(duration)} Сек
        </span>
        <button
          type="button"
          onClick={handleClose}
          className="bg-rose-600 rounded-full p-2 inline-flex items-center justify-center text-white"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default AudioPlayer;
