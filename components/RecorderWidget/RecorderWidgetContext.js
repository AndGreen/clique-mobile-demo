import React, { useEffect, createContext, useState, useContext } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';

const RecorderWidgetContext = createContext();

export const RECORD_STATE = {
    INIT: '',
    NEW_RECORD: 'NewRecord',
    PREVIEW_RECORD: 'PreviewRecord',
};

export const RecorderWidgetProvider = ({ children }) => {
    const [isOpen, setIsOpen] = useState(null);
    const [state, setState] = useState(RECORD_STATE.INIT);
    const navigation = useNavigation();
    const route = useRoute();

    useEffect(() => {
        console.log('state', state);
    }, [state]);

    useEffect(() => {
        const handleStateChange = () => {
            const currentRouteName = route.name;
            if (
                (currentRouteName === RECORD_STATE.NEW_RECORD ||
                    currentRouteName === RECORD_STATE.PREVIEW_RECORD) &&
                !isOpen
            ) {
                showRecorderWidget(true);
            } else if (
                !(
                    currentRouteName === RECORD_STATE.NEW_RECORD ||
                    currentRouteName === RECORD_STATE.PREVIEW_RECORD
                ) &&
                isOpen
            ) {
                hideRecorderWidget();
            }
        };

        handleStateChange();
    }, [route.name, isOpen]);

    const showRecorderWidget = (replace = false) => {
        setState(RECORD_STATE.NEW_RECORD);
        setIsOpen(true);
    };

    const showPreviewRecorderWidget = () => {
        setState(RECORD_STATE.PREVIEW_RECORD);
    };

    const hideRecorderWidget = () => {
        setState(RECORD_STATE.INIT);
        setIsOpen(false);
    };

    const goBack = () => {
        if (state === RECORD_STATE.PREVIEW_RECORD) {
            setState(RECORD_STATE.NEW_RECORD);
        } else if (state === RECORD_STATE.NEW_RECORD) {
            setState(RECORD_STATE.INIT);
        }
    };

    return (
        <RecorderWidgetContext.Provider
            value={{
                isRecorderWidgetOpen: isOpen,
                recorderWidgetState: state,
                goBack,
                showRecorderWidget,
                showPreviewRecorderWidget,
                hideRecorderWidget,
            }}>
            {children}
        </RecorderWidgetContext.Provider>
    );
};

export const useRecorderWidget = () => {
    return useContext(RecorderWidgetContext);
};
