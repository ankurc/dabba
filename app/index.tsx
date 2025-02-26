import React from 'react';
import { View, StyleSheet, Image, useWindowDimensions } from 'react-native';
import { Text, Button, Surface, ActivityIndicator } from 'react-native-paper';
import { Link, router, Redirect } from 'expo-router';
import { spacing } from '../constants/theme';
import { useAuth } from '../hooks/useAuth';

export default function Welcome() {
  const { user, loading } = useAuth();
  const { width } = useWindowDimensions();

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (user) {
    return <Redirect href="/(main)/dashboard" />;
  }

  return (
    <View style={styles.container}>
      <Surface style={styles.header} elevation={0}>
        <Image
          source={require('../assets/images/logo.webp')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Surface>

      <View style={styles.content}>
        <Text variant="displaySmall" style={styles.title}>
          Delicious Meals,{'\n'}Delivered Fresh
        </Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          • Chef-crafted meals{'\n'}
          • Fresh ingredients{'\n'}
          • Flexible delivery{'\n'}
          • No commitment
        </Text>
      </View>

      <View style={styles.footer}>
        <Link href="/(auth)/register" asChild>
          <Button 
            mode="contained" 
            style={styles.button}
            contentStyle={styles.buttonContent}
            icon="account-plus"
          >
            Create Account
          </Button>
        </Link>
        
        <Link href="/(auth)/login" asChild>
          <Button 
            mode="outlined" 
            style={styles.button}
            contentStyle={styles.buttonContent}
            icon="login"
          >
            Sign In
          </Button>
        </Link>
        
        <Text variant="bodySmall" style={styles.terms}>
          By continuing, you agree to our Terms of Service{'\n'}
          and Privacy Policy
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: spacing.xl * 2,
    paddingBottom: spacing.lg,
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
  },
  title: {
    textAlign: 'left',
    marginBottom: spacing.xl,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  subtitle: {
    lineHeight: 28,
    color: '#666',
  },
  footer: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  button: {
    width: '100%',
  },
  buttonContent: {
    paddingVertical: 8,
  },
  terms: {
    textAlign: 'center',
    marginTop: spacing.md,
    color: '#666',
  },
});
