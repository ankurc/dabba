import { Stack } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { Redirect } from 'expo-router';

export default function AuthLayout() {
  const { user } = useAuth();

  // Redirect to main app if user is authenticated
  if (user) {
    return <Redirect href="/(main)/dashboard" />;
  }

  return (
    <Stack>
      <Stack.Screen
        name="login"
        options={{
          title: 'Login',
        }}
      />
      <Stack.Screen
        name="register"
        options={{
          title: 'Sign Up',
        }}
      />
    </Stack>
  );
} 