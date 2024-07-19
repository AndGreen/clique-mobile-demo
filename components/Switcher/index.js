import React, { useState } from 'react';
import { Text, View } from 'react-native';

export function Switcher({ leftLabel, rightLabel, defaultState, onToggle }) {
    const [isOn, setIsOn] = useState(!!defaultState);

    const handleToggleVoiceOrText = () => {
        setIsOn(!isOn);
        onToggle && onToggle(!isOn);
    };

    return (
        <View
            className="switcher flex items-center gap-1 text-white"
            onClick={handleToggleVoiceOrText}>
            {leftLabel && (
                <Text htmlFor="switch" className={!isOn ? 'opacity-50' : 'opacity-100'}>
                    {leftLabel}
                </Text>
            )}
            <View
                role="switch"
                aria-checked={isOn}
                className={`relative w-10 h-6 flex items-center bg-[#0000001A] rounded-[100px] cursor-pointer transition-colors duration-300`}>
                <View
                    className={`absolute w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                        isOn ? 'translate-x-1' : 'translate-x-4'
                    }`}
                />
            </View>
            {rightLabel && (
                <Text htmlFor="switch" className={isOn ? 'opacity-50' : 'opacity-100'}>
                    {rightLabel}
                </Text>
            )}
        </View>
    );
}
