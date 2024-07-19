import { Link, Stack } from 'expo-router';
import { Image, Text, View, StyleSheet } from 'react-native';

export default function Home() {
    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    title: 'My home',
                    headerStyle: { backgroundColor: '#f4511e' },
                    headerTintColor: '#fff',
                    headerTitleStyle: {
                        fontWeight: 'bold',
                    },
                    headerTitle: props => <Image style={styles.image} source={{ uri: 'https://reactnative.dev/img/tiny_logo.png' }} />
                }}
            />
            <Text>Home Screen</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    image: {
        width: 50,
        height: 50,
    },
});
