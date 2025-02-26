export default {
  expo: {
    // ... other config
    extra: {
      EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    },
  },
}; 