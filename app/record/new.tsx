import {Text, View} from "react-native";
import {Stack} from "expo-router";

export default function Screen() {
    return (
        <View>
            <Stack.Screen
                options={{
                    title: 'New Record',
                }}
            />
            <Text>New Record</Text>
        </View>
    );
}
