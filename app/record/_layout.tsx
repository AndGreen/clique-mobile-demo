import {RecorderWidgetProvider} from "@/components/RecorderWidget/RecorderWidgetContext";
import {AudioPlayerProvider} from "@/components/AudioPlayer/AudioPlayerContext";
import {Stack} from "expo-router";

export default function RecordLayout() {
    return (
        // <RecorderWidgetProvider>
        //     <AudioPlayerProvider>
                <Stack screenOptions={{ headerShown: false }}/>
            // </AudioPlayerProvider>
        // </RecorderWidgetProvider>
    );
}
