import React, { useState, useEffect, useRef } from "react";

import { Switcher } from "../Switcher";
import RecorderWidgetIcon from "./RecorderWidgetIcon";
import { useRecorderWidget, RECORD_STATE } from "./RecorderWidgetContext";
import { useAudioPlayer } from "../AudioPlayer/AudioPlayerContext";
import { ReactComponent as ArrowRightIcon } from "./assets/arrow-right.svg";
import { ReactComponent as BackIcon } from "./assets/back.svg";
import { ReactComponent as PlayIcon } from "./assets/play.svg";
import { ReactComponent as PauseIcon } from "./assets/pause.svg";
import "./RecorderWidget.css";

const RECORDING_STATUS = {
  RECORDING: "recording",
  PAUSED: "paused",
  STOPPED: "stopped",
  CANCELED: "canceled",
};

function millisToMinutesAndSeconds(millis) {
  const minutes = Math.floor(millis / 60000);
  const seconds = ((millis % 60000) / 1000).toFixed(0);

  return minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
}

function timeout(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const MAX_RECORD_TIME = 420000;
const TRANSCRIPTION_TIMEOUT = 1500;
const IS_VOICE = "isVoice";

const LISTENING_TO_YOU = "Clique слушает тебя";
const DONE = "Готово";
const VOICE = "Голос";
const TEXT = "Текст";
const LISTENING = "Слушаю...";
const TRANSCRIBING_PLACEHOLDER = "Расшифровываю запись...";
const DECRYPTED_TEXT_PLACEHOLDER = "Расшифрованный текст будет здесь";
const PAUSED_LISTENING = "Запись на паузе";
const BEAM_IT = "Опубликовать";
const TRANSCRIBING = "Обработка...";
const INPUT_PLACEHOLDER = "Напиши свой бим";
const EDIT_YOUR_THOUGHT = "Отредактируй свою мысль";

function RecorderWidget() {
  const {
    isRecorderWidgetOpen: isOpen,
    recorderWidgetState,
    showPreviewRecorderWidget,
    showRecorderWidget,
    goBack,
  } = useRecorderWidget();
  const { isPlaying, play, pause, currentUrl } = useAudioPlayer();
  const mediaRecorderRef = useRef(null);
  const textareaRef = useRef(null); // Create a ref for the textarea
  const recordingTimeoutRef = useRef(null); // For stopping the recording
  const wakeLockRef = useRef(null);
  const [timer, setTimer] = useState(null);
  const [intervalId, setIntervalId] = useState(null);
  const [isAudioTranscribing, setIsAudioTranscribing] = useState(false);
  const [isOnVoice, setIsOnVoice] = useState(
      // TODO: update to asyncStorage
    localStorage.getItem(IS_VOICE) === "true"
  );
  const [text, setText] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [recordingStatus, setRecordingStatus] = useState("");

  useEffect(() => {
    // Clear the timeouts when the component is unmounted to avoid memory leaks
    return () => {
      if (recordingTimeoutRef.current)
        clearTimeout(recordingTimeoutRef.current);
      if (wakeLockRef.current) {
        wakeLockRef.current.release();
        wakeLockRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const preventDefault = (e) => {
      e.preventDefault();
    };

    if (isOpen) {
      // Add event listeners to disable scroll
      //TODO update to react native
      window.addEventListener("wheel", preventDefault, { passive: false });
      window.addEventListener("touchmove", preventDefault, { passive: false });

      // Remove event listeners on cleanup
      return () => {
        window.removeEventListener("wheel", preventDefault);
        window.removeEventListener("touchmove", preventDefault);
      };
    }
  }, [isOpen]);

  useEffect(() => {
    if (
      isOpen &&
      isOnVoice &&
      recorderWidgetState === RECORD_STATE.NEW_RECORD
    ) {
      startRecording();
    }

    if (recorderWidgetState === RECORD_STATE.INIT) {
      resetRecording();
      setText("");
    }

    if (!isOnVoice) {
      resetRecording();
    }
  }, [isOpen, isOnVoice, recorderWidgetState]);

  useEffect(() => {
    if (recordingStatus === RECORDING_STATUS.RECORDING) {
      setIntervalId(null);
      setTimer(0);

      // Start or resume the timer
      const id = setInterval(() => {
        setTimer((prevTimer) => prevTimer + 1);
      }, 1000);
      setIntervalId(id);
    } else if (
      recordingStatus === RECORDING_STATUS.PAUSED ||
      recordingStatus === RECORDING_STATUS.STOPPED
    ) {
      // Pause the timer
      if (intervalId) {
        clearInterval(intervalId);
        setIntervalId(null);
      }
    } else {
      // Stop and reset the timer
      clearInterval(intervalId);
      setIntervalId(null);
      setTimer(0);
    }

    return () => {
      // Clean up interval on component unmount
      clearInterval(intervalId);
    };
  }, [recordingStatus]);

  const handleTogglePlayer = () => {
    isPlaying && currentUrl === audioUrl ? pause() : play(audioUrl);
  };

  const handleToggleVoiceOrText = (isOn) => {
    setIsOnVoice(isOn);
    // TODO: AsyncStorage
    localStorage.setItem(IS_VOICE, `${isOn}`);
  };

  const handleDone = (e) => {
    e.stopPropagation();

    if (isOnVoice) {
      stopRecording();
    }
    showPreviewRecorderWidget();
  };

  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const sendAudioForTranscription = async (audioBlob) => {
    const base64Audio = await blobToBase64(audioBlob);

    await timeout(TRANSCRIPTION_TIMEOUT);

    setIsAudioTranscribing(false);
    setAudioUrl(base64Audio);
    setText(DECRYPTED_TEXT_PLACEHOLDER);
  };

  const handleRecordComplete = (status) => {
    setIsAudioTranscribing(true);
    setText(status);
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.pause();
      setRecordingStatus(RECORDING_STATUS.PAUSED);
      handleRecordComplete(PAUSED_LISTENING);
    }
  };

  // Handle visibility change (e.g., control center or background)
  const handleVisibilityChange = () => {
    if (
        //TODO: update to react native
      document.visibilityState === "hidden" &&
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === RECORDING_STATUS.RECORDING
    ) {
      pauseRecording();
      console.log("Recording stopped due to app going to the background");
    }
  };

  // Helper function to format the timer into mm:ss format
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const adjustHeight = (element) => {
    element.style.height = "inherit";
    element.style.height = `${element.scrollHeight + 2}px`;
  };

  const handleKeyDown = async (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      await submitForm(event);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecordingStatus(RECORDING_STATUS.STOPPED);
      handleRecordComplete(TRANSCRIBING_PLACEHOLDER);

      // Clear the timeouts as we manually stopped the recording
      if (recordingTimeoutRef.current) {
        clearTimeout(recordingTimeoutRef.current);
      }
      console.log("stopping tracks");
      mediaRecorderRef.current?.stream
        .getTracks()
        .forEach((track) => track.stop());
    }
    if (wakeLockRef.current) {
      wakeLockRef.current.release();
      wakeLockRef.current = null;
      console.log("Wake Lock has been released");
    }
  };

  const startRecording = async () => {
    resetRecording();

    try {
      // Request audio recording permission and get the audio stream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      // Initialize the media recorder
      mediaRecorderRef.current = new MediaRecorder(stream);
      const audioChunks = [];

      // Event triggered when recording stops
      mediaRecorderRef.current.onstop = async () => {
        // Check if any audio data was recorded
        if (audioChunks.length === 0) {
          console.error("No audio chunks available");
          return;
        }

        // Create an audio blob from the collected chunks
        const audioBlob = new Blob(audioChunks, { type: "audio/mp4" });
        console.log(`Audio Blob Size: ${audioBlob.size} bytes`);

        if (audioBlob.size === 0) {
          console.error("Audio Blob is empty.");
          return;
        }

        // Send the audio blob for transcription
        await sendAudioForTranscription(audioBlob);
      };

      // Collect audio data chunks as they become available
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          console.log("Audio chunk captured:", event.data);
          audioChunks.push(event.data);
        } else {
          console.warn("Empty or missing audio data in this chunk.");
        }
      };

      // Start the media recorder
      mediaRecorderRef.current.start();
      setRecordingStatus(RECORDING_STATUS.RECORDING);
      handleRecordComplete(LISTENING);

      // Set up a timer for the recording limit
      recordingTimeoutRef.current = window.setTimeout(() => {
        stopRecording();
      }, MAX_RECORD_TIME);

      // Request a wake lock if supported
      try {
        if ("wakeLock" in navigator && navigator.wakeLock.request) {
          // @ts-ignore
          wakeLockRef.current = await navigator.wakeLock.request("screen");
        }
      } catch (err) {
        console.error(`Could not obtain wake lock: ${err.message}`);
      }

      document.addEventListener("visibilitychange", handleVisibilityChange);
    } catch (err) {
      // Handle possible permission issues or other errors
      console.error(`Error starting recording: ${err.message}`);
    }
  };

  const resetRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null; // Discard the MediaRecorder instance
      setRecordingStatus(RECORDING_STATUS.CANCELED);
    }

    setAudioUrl("");
  };

  const submitForm = async (e) => {
    e.preventDefault();

    console.log("Done");
  };

  return (
    <div className="recorder-widget">
      <div
        className={`flex items-center justify-center flex-col ${
          isOpen === true && "bg-primary"
        } ${isOpen === false && "bg-primary-out"}`}
      >
        <div
          className={`animation ${isOpen === true && "fill-animation"} ${
            isOpen === false && "fillout-animation"
          } ${
            recorderWidgetState === RECORD_STATE.PREVIEW_RECORD &&
            "bg-secondary"
          }`}
        />
        <div className="main max-w-screen-sm flex items-center justify-center gap-5 flex-col w-full px-3 sm:px-0">
          {recorderWidgetState === RECORD_STATE.INIT && (
            <RecorderWidgetIcon
              className="clique my-0 mx-auto cursor-pointer"
              onClick={() => showRecorderWidget()}
            />
          )}
          {isOpen && (
            <button
              className={`absolute top-5 left-3 sm:left-6 rounded-full focus:outline-none focus:shadow-outline ${
                recorderWidgetState === RECORD_STATE.NEW_RECORD
                  ? "text-[#FFFFFF]"
                  : "text-[#F1F3F4]"
              }`}
              onClick={goBack}
            >
              <BackIcon />
            </button>
          )}
          {recorderWidgetState === RECORD_STATE.NEW_RECORD && (
            <>
              {isOpen && (
                <Switcher
                  onToggle={handleToggleVoiceOrText}
                  defaultState={isOnVoice}
                  leftLabel={VOICE}
                  rightLabel={TEXT}
                />
              )}
              {isOpen && isOnVoice && (
                <RecorderWidgetIcon className="clique my-0 mx-auto" />
              )}
              {isOpen && !isOnVoice && (
                <textarea
                  className="h-full w-full min-h-[170px] p-3.5 resize-none rounded-lg focus:outline-none bg-[#0000001A] placeholder-[#FFFFFF] placeholder-opacity-50 text-[#FFFFFF]"
                  ref={textareaRef}
                  id="entry"
                  name="text"
                  rows={1}
                  disabled={isAudioTranscribing}
                  placeholder={INPUT_PLACEHOLDER}
                  value={text}
                  onChange={(e) => {
                    setText(e.target.value);
                  }}
                  onInput={(e) => adjustHeight(e.target)}
                  onKeyDown={handleKeyDown}
                />
              )}
              {isOpen && (
                <div className="flex items-center flex-col gap-3 text-white">
                  {isOnVoice && (
                    <>
                      <p>{LISTENING_TO_YOU}</p>
                      <p>
                        {formatTime(timer)}
                        <span>
                          {" "}
                          / {millisToMinutesAndSeconds(MAX_RECORD_TIME)}
                        </span>
                      </p>
                    </>
                  )}
                  <button
                    className="flex flex-row items-center justify-center gap-2 min-h-8 py-2 px-5 rounded-full focus:outline-none focus:shadow-outline bg-[#FFFFFF] text-[#292626]"
                    onClick={handleDone}
                  >
                    <ArrowRightIcon />
                    {DONE}
                  </button>
                </div>
              )}
            </>
          )}
          {recorderWidgetState === RECORD_STATE.PREVIEW_RECORD && (
            <div className="w-full">
              <div className="mb-3">
                <h2 className="mb-1.5 text-3xl">{EDIT_YOUR_THOUGHT}</h2>
                {recordingStatus === RECORDING_STATUS.STOPPED && audioUrl && (
                  <div className="flex gap-2 items-center ml-0">
                    <div className="focus:outline-none shadow-sm focus:shadow-outline flex items-center bg-slate-100 rounded-full pr-3 z-20">
                      <button
                        type="button"
                        onClick={handleTogglePlayer}
                        className="flex items-center h-10 w-10 justify-center rounded-full"
                      >
                        {isPlaying && currentUrl === audioUrl ? (
                          <PauseIcon className="h-10 w-10" />
                        ) : (
                          <PlayIcon className="h-10 w-10" />
                        )}
                      </button>
                      <div className="text-sm ml-1">
                        <p className="text-slate-600">{formatTime(timer)}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="relative pt-3 bg-[#F2F2F2]">
                <div className="preview-background" />
                <form onSubmit={submitForm} className="w-full">
                  <textarea
                    className="h-full w-full min-h-[170px] p-3.5 resize-none rounded-lg focus:outline-none bg-[#FFFFFF] placeholder-[#292626] placeholder-opacity-50 text-[#292626]"
                    ref={textareaRef}
                    id="entry"
                    name="text"
                    rows={1}
                    disabled={isAudioTranscribing}
                    placeholder={INPUT_PLACEHOLDER}
                    value={text}
                    onChange={(e) => {
                      setText(e.target.value);
                    }}
                    onInput={(e) => adjustHeight(e.target)}
                    onKeyDown={handleKeyDown}
                  />

                  {recordingStatus !== RECORDING_STATUS.RECORDING &&
                    recordingStatus !== RECORDING_STATUS.PAUSED && (
                      <button
                        className="flex flex-row items-center justify-center gap-2 w-full min-h-8 py-2 px-5 rounded-full focus:outline-none focus:shadow-outline bg-[#EE473A] text-[#FFFFFF]"
                        disabled={
                          text === "" ||
                          isAudioTranscribing ||
                          recordingStatus === RECORDING_STATUS.RECORDING ||
                          recordingStatus === RECORDING_STATUS.PAUSED
                        }
                        type="submit"
                      >
                        {isAudioTranscribing ? (
                          TRANSCRIBING
                        ) : (
                          <>
                            <ArrowRightIcon />
                            {BEAM_IT}
                          </>
                        )}
                      </button>
                    )}
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RecorderWidget;
