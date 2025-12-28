import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BookmarkProvider } from './context/BookmarkContext';
import { NotificationProvider } from './context/NotificationContext';
import { ToastProvider } from './context/ToastContext';
import { SignupProvider } from './context/SignupContext';
import { View, Platform, StyleSheet } from 'react-native';

// 화면 컴포넌트 import
import LoginScreen from './screens/LoginScreen';
import EnterEmailScreen from './screens/EnterEmailScreen';
import EnterPwScreen from './screens/EnterPwScreen';
import EmailVerificationScreen from './screens/EmailVerificationScreen';
import HomeScreen from './screens/HomeScreen';
import DetailScreen from './screens/DetailScreen';
import SearchScreen from './screens/SearchScreen';
import SettingScreen from './screens/SettingScreen';
import AlertScreen from './screens/AlertScreen';
import ScrapScreen from './screens/ScrapScreen';
import ChatbotScreen from './screens/ChatbotScreen';
import MyInfoScreen from './screens/MyInfoScreen';
import DepartmentSelectionScreen from './screens/DepartmentSelectionScreen';
import StudentIdSelectionScreen from './screens/StudentIdSelectionScreen';
import NotificationSettingsScreen from './screens/NotificationSettingsScreen';
import KeywordSettingsScreen from './screens/KeywordSettingsScreen';
import DeleteAccountScreen from './screens/DeleteAccountScreen';
// 새로운 회원가입 플로우 화면
import SignupNameScreen from './screens/SignupNameScreen';
import SignupStudentIdScreen from './screens/SignupStudentIdScreen';
import SignupDepartmentScreen from './screens/SignupDepartmentScreen';
import SignupEmailScreen from './screens/SignupEmailScreen';
import SignupPasswordScreen from './screens/SignupPasswordScreen';

export type RootStackParamList = {
  Login: undefined;
  EnterEmail: undefined;
  EnterPw: undefined;
  EmailVerification: { email: string };
  Home: undefined;
  Detail: undefined;
  Search: undefined;
  Setting: undefined;
  Alert: undefined;
  Scrap: undefined;
  Chatbot: undefined;
  MyInfo: undefined;
  DepartmentSelection: { onSelect?: (department: string) => void } | undefined;
  StudentIdSelection: { onSelect?: (studentId: string) => void } | undefined;
  NotificationSettings: undefined;
  KeywordSettings: undefined;
  DeleteAccount: undefined;
  // 새로운 회원가입 플로우
  SignupName: undefined;
  SignupStudentId: { name: string };
  SignupDepartment: { name: string; studentId: string };
  SignupEmail: { name: string; studentId: string; department: string };
  SignupPassword: { name: string; studentId: string; department: string; email: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function AppContent() {
  return (
    <View style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        >
          <Stack.Group>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="EnterEmail" component={EnterEmailScreen} />
            <Stack.Screen name="EnterPw" component={EnterPwScreen} />
            <Stack.Screen name="EmailVerification" component={EmailVerificationScreen} />
            {/* 새로운 회원가입 플로우 */}
            <Stack.Screen name="SignupName" component={SignupNameScreen} />
            <Stack.Screen name="SignupStudentId" component={SignupStudentIdScreen} />
            <Stack.Screen name="SignupDepartment" component={SignupDepartmentScreen} />
            <Stack.Screen name="SignupEmail" component={SignupEmailScreen} />
            <Stack.Screen name="SignupPassword" component={SignupPasswordScreen} />
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Detail" component={DetailScreen} />
            <Stack.Screen name="Search" component={SearchScreen} />
            <Stack.Screen name="Alert" component={AlertScreen} />
            <Stack.Screen name="Scrap" component={ScrapScreen} />
            <Stack.Screen name="Chatbot" component={ChatbotScreen} />
            <Stack.Screen name="MyInfo" component={MyInfoScreen} />
            <Stack.Screen name="DepartmentSelection" component={DepartmentSelectionScreen} />
            <Stack.Screen name="StudentIdSelection" component={StudentIdSelectionScreen} />
            <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
            <Stack.Screen name="KeywordSettings" component={KeywordSettingsScreen} />
            <Stack.Screen name="DeleteAccount" component={DeleteAccountScreen} />
            <Stack.Screen name="Setting" component={SettingScreen} />
          </Stack.Group>
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
}

export default function App() {
  return (
    <View style={styles.outerContainer}>
      <View style={styles.appContainer}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <ToastProvider>
            <SignupProvider>
              <NotificationProvider>
                <BookmarkProvider>
                  <AppContent />
                </BookmarkProvider>
              </NotificationProvider>
            </SignupProvider>
          </ToastProvider>
        </GestureHandlerRootView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#E5E5E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appContainer: {
    flex: 1,
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 430 : '100%',
    backgroundColor: '#FFFFFF',
    ...(Platform.OS === 'web' && {
      boxShadow: '0 0 20px rgba(0, 0, 0, 0.1)',
    }),
  },
});
