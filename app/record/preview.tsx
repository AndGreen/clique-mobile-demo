import {Text, View} from "react-native";
import {Stack} from "expo-router";

export default function Screen() {
    return (
        <View className="flex-1 justify-center items-center">
            <Stack.Screen
                options={{
                    title: 'Preview Record',
                }}
            />
            <Text>Preview Record</Text>
        </View>
    );
}
