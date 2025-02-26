import 'react-native-gesture-handler';
import { StripeProvider } from '@stripe/stripe-react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StripeProvider
        publishableKey="your_publishable_key"
        merchantIdentifier="your_merchant_identifier" // Optional for Apple Pay
      >
        {/* Your existing app content */}
      </StripeProvider>
    </GestureHandlerRootView>
  );
} 