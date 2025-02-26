import { useEffect } from 'react';
import { Redirect, Stack } from 'expo-router';
import { useAuth } from '../hooks/useAuth';
import { PaperProvider } from 'react-native-paper';
import { theme } from '../constants/theme';
import { Slot } from 'expo-router';

export default function RootLayout() {
  const { user, loading, isAuthenticated } = useAuth();

  // Add this console log to debug auth state
  console.log('Auth state:', isAuthenticated);

  if (loading) {
    return null; // Or a loading screen
  }

  return (
    <PaperProvider theme={theme}>
      <Stack>
        <Stack.Screen
          name="(auth)"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="(main)"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </PaperProvider>
  );
}
