import { Redirect, Stack } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';

export default function MainLayout() {
  const { isAuthenticated, loading } = useAuth();
  
  console.log('MainLayout - Auth state:', { isAuthenticated, loading });

  if (!isAuthenticated && !loading) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Stack />;
} 