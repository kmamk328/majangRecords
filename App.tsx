import React from 'react';
import { NativeBaseProvider } from 'native-base';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MemberInputScreen from './src/screens/MemberInputScreen';
import ScoreInputScreen from './src/screens/ScoreInputScreen';
import ResultScreen from './src/screens/ResultScreen';
import InquireScreen from './src/screens/InquireScreen';
import { View, Text } from 'react-native';
// import MemberInputScreen from './src/components/MemberInputScreen';
// import ScoreInputScreen from './src/components/ScoreInputScreen';
// import ResultScreen from './src/components/ResultScreen';


function PlaceholderScreen({ text }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>{text}</Text>
    </View>
  );
}

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainStackNavigator() {
  return (
    <Stack.Navigator initialRouteName="MemberInput">
      <Stack.Screen
        name="MemberInput"
        component={MemberInputScreen}
      />
      <Stack.Screen
        name="ScoreInput"
        component={ScoreInputScreen}
      />
    </Stack.Navigator>
  );
}

// export default App;
export default function App() {
  return (
    <NativeBaseProvider>
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen
            name="戦歴"
            component={InquireScreen}
            options={{ headerShown: false }} // タブナビゲーションのヘッダーを非表示に設定
          />
          <Tab.Screen
            name="記録"
            component={MainStackNavigator}
            options={{ headerShown: false }} // タブナビゲーションのヘッダーを非表示に設定
          />
          <Tab.Screen
            name="結果"
            component={ResultScreen}
            options={{ headerShown: false }} // タブナビゲーションのヘッダーを非表示に設定
          />
      </Tab.Navigator>
    </NavigationContainer>
    </NativeBaseProvider>
  );
}