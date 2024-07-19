import React, { useState } from "react";

export function Switcher({ leftLabel, rightLabel, defaultState, onToggle }) {
  const [isOn, setIsOn] = useState(!!defaultState);

  const handleToggleVoiceOrText = () => {
    setIsOn(!isOn);
    onToggle && onToggle(!isOn);
  };

  return (
    <div
      className="switcher flex items-center gap-1 text-white"
      onClick={handleToggleVoiceOrText}
    >
      {leftLabel && (
        <label
          htmlFor="switch"
          className={!isOn ? "opacity-50" : "opacity-100"}
        >
          {leftLabel}
        </label>
      )}
      <div
        role="switch"
        aria-checked={isOn}
        className={`relative w-10 h-6 flex items-center bg-[#0000001A] rounded-[100px] cursor-pointer transition-colors duration-300`}
      >
        <div
          className={`absolute w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
            isOn ? "translate-x-1" : "translate-x-4"
          }`}
        />
      </div>
      {rightLabel && (
        <label htmlFor="switch" className={isOn ? "opacity-50" : "opacity-100"}>
          {rightLabel}
        </label>
      )}
    </div>
  );
}
