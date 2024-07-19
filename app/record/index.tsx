import {Text, View} from "react-native";
import {Stack} from "expo-router";

export default function Home() {
    return (
        <View className="flex-1 justify-center items-center">
            <Stack.Screen
                options={{
                    title: 'My home',
                }}
            />
            <Text>Home Screen</Text>
        </View>
    );
}
