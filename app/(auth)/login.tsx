import React, { useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { TextInput, Button, Text, HelperText, Portal, Dialog } from 'react-native-paper'
import { useAuth } from '../../hooks/useAuth'
import { Link, router } from 'expo-router'

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [showOtpDialog, setShowOtpDialog] = useState(false)
  const [error, setError] = useState('')
  const { signIn, verifyOtp } = useAuth()

  const handleLogin = async () => {
    setLoading(true)
    setError('')
    try {
      const { error } = await signIn(email, password)
      if (error) {
        setError(error.message)
      } else {
        setShowOtpDialog(true)
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('An error occurred during login')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async () => {
    setLoading(true)
    setError('')
    try {
      const { error } = await verifyOtp(email, otpCode)
      if (error) {
        setError(error.message)
      } else {
        setShowOtpDialog(false)
        router.replace('/(main)/dashboard')
      }
    } catch (error) {
      console.error('OTP verification error:', error)
      setError('Failed to verify OTP')
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>Welcome Back</Text>
      
      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        style={styles.input}
        keyboardType="email-address"
        error={!!error}
      />
      
      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
        error={!!error}
      />
      
      {error && (
        <HelperText type="error" visible={!!error}>
          {error}
        </HelperText>
      )}

      <Button
        mode="contained"
        onPress={handleLogin}
        loading={loading}
        style={styles.button}
        disabled={loading || !email || !password}
      >
        Login
      </Button>
      
      <Link href="/(auth)/register" asChild>
        <Button mode="text">Don't have an account? Sign Up</Button>
      </Link>

      <Portal>
        <Dialog visible={showOtpDialog} dismissable={false}>
          <Dialog.Title>Verify Your Identity</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium" style={styles.otpMessage}>
              Please enter the verification code sent to your phone
            </Text>
            <TextInput
              label="Verification Code"
              value={otpCode}
              onChangeText={setOtpCode}
              keyboardType="number-pad"
              maxLength={6}
              style={styles.otpInput}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button 
              onPress={handleVerifyOtp}
              loading={loading}
              disabled={loading || otpCode.length !== 6}
            >
              Verify
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    marginBottom: 10,
  },
  button: {
    marginTop: 10,
    marginBottom: 10,
  },
  otpMessage: {
    marginBottom: 16,
  },
  otpInput: {
    marginTop: 8,
  },
})