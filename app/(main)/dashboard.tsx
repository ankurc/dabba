import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, Platform, StatusBar } from 'react-native';
import { Text, Button, ActivityIndicator, Divider, TextInput, Portal, Modal, List, Chip } from 'react-native-paper';
import { router } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { usePlans } from '../../hooks/usePlans';
import { PlanCard } from '../../components/plans/PlanCard';
import { SubscriptionsList } from '../../components/subscription/SubscriptionsList';
import { subscriptionPlans, SubscriptionPlan } from '../../data/subscriptionPlans';
import { DAYS_OF_WEEK, DayId } from '../../constants/dates';

export default function Dashboard() {
  const { signOut, user, loading: authLoading, updateProfile } = useAuth();
  const { plans, loading: plansLoading, error: plansError } = usePlans();
  const [showEditModal, setShowEditModal] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [showPlanConfirmation, setShowPlanConfirmation] = useState(false);
  const [includePremiumDelivery, setIncludePremiumDelivery] = useState(false);
  const [selectedDays, setSelectedDays] = useState<DayId[]>([]);

  const handleOpenEditModal = useCallback(() => {
    // Prefill data when opening modal
    setFirstName(user?.user_metadata?.first_name || '');
    setLastName(user?.user_metadata?.last_name || '');
    setEmail(user?.email || '');
    setShowEditModal(true);
  }, [user]);

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setFirstName('');
    setLastName('');
    setEmail('');
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await updateProfile({ 
        first_name: firstName, 
        last_name: lastName, 
        email 
      });
      handleCloseEditModal();
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePlanSelect = useCallback((plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setSelectedDays([]);
    setShowPlanConfirmation(true);
  }, []);

  const handleDayToggle = useCallback((dayId: DayId) => {
    setSelectedDays(prev => {
      if (prev.includes(dayId)) {
        return prev.filter(d => d !== dayId);
      }
      if (selectedPlan && prev.length >= selectedPlan.mealsPerWeek) {
        return [...prev.slice(1), dayId];
      }
      return [...prev, dayId];
    });
  }, [selectedPlan]);

  const calculateTotal = useCallback(() => {
    if (!selectedPlan) return 0;
    let total = selectedPlan.price;
    if (includePremiumDelivery) {
      // $4 per day for 14 days
      total += 56; // $4 * 14 days
    }
    return total;
  }, [selectedPlan, includePremiumDelivery]);

  const handleConfirmPlan = useCallback(async () => {
    try {
      if (!selectedDays.length) {
        alert('Please select delivery days');
        return;
      }
      setShowPlanConfirmation(false);
      router.push({
        pathname: '/(main)/checkout',
        params: {
          planId: selectedPlan?.id,
          premiumDelivery: includePremiumDelivery ? 'true' : 'false',
          total: calculateTotal(),
          deliveryDays: selectedDays.join(',')
        }
      });
    } catch (error) {
      console.error('Failed to subscribe to plan:', error);
      alert('Failed to subscribe to plan');
    }
  }, [selectedPlan, includePremiumDelivery, calculateTotal, selectedDays]);

  console.log('Dashboard - Auth state:', { user, authLoading });

  if (authLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text>Not authenticated</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text variant="titleMedium" style={styles.welcomeText}>
              Welcome back,
            </Text>
            <Text 
              variant="headlineMedium" 
              onPress={handleOpenEditModal}
              style={styles.editableText}
            >
              {user?.user_metadata?.first_name 
                ? `${user.user_metadata.first_name}`
                : user?.email}
            </Text> 
          </View>
          <Button 
            mode="outlined" 
            onPress={signOut}
            style={styles.signOutButton}
            labelStyle={styles.signOutButtonLabel}
          >
            Sign Out
          </Button>
        </View>

        <Portal>
          <Modal
            visible={showEditModal}
            onDismiss={handleCloseEditModal}
            contentContainerStyle={styles.modal}
          >
            <Text variant="titleLarge" style={styles.modalTitle}>Edit Profile</Text>
            <TextInput
              label="First Name"
              value={firstName}
              onChangeText={setFirstName}
              style={styles.input}
            />
            <TextInput
              label="Last Name"
              value={lastName}
              onChangeText={setLastName}
              style={styles.input}
            />
            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />
            <View style={styles.modalButtons}>
              <Button 
                mode="outlined" 
                onPress={handleCloseEditModal}
                style={styles.modalButton}
              >
                Cancel
              </Button>
              <Button 
                mode="contained" 
                onPress={handleSaveProfile}
                loading={saving}
                style={styles.modalButton}
              >
                Save
              </Button>
            </View>
          </Modal>
        </Portal>


        <Text variant="titleLarge" style={styles.sectionTitle}>
          Your Subscriptions
        </Text>
        <SubscriptionsList />

        <Divider style={styles.divider} />
        <Text variant="titleLarge" style={styles.sectionTitle}>
          Available Plans
        </Text>
        <View style={styles.plansList}>
          {subscriptionPlans.map((plan) => (
            <PlanCard 
              key={plan.id} 
              plan={plan} 
              onSelect={handlePlanSelect}
              isSelected={selectedPlan?.id === plan.id}
            />
          ))}
        </View>

        <Divider style={styles.divider} />



        <Text variant="titleLarge" style={styles.sectionTitle}>
          Account Settings
        </Text>
        <List.Section style={styles.settingsSection}>
          <List.Item
            title="Address Book"
            description="Manage delivery addresses"
            left={props => <List.Icon {...props} icon="map-marker" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => router.push('/(main)/address-book')}
            style={styles.settingsItem}
          />
          <Divider />
          <List.Item
            title="Payment Methods"
            description="Manage payment options"
            left={props => <List.Icon {...props} icon="credit-card" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => router.push('/(main)/manage-payment')}
            style={styles.settingsItem}
          />
          <Divider />
          <List.Item
            title="Billing History"
            description="View past transactions"
            left={props => <List.Icon {...props} icon="history" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => router.push('/(main)/billing-history')}
            style={styles.settingsItem}
          />
        </List.Section>

        <Portal>
          <Modal
            visible={showPlanConfirmation}
            onDismiss={() => setShowPlanConfirmation(false)}
            contentContainerStyle={styles.modal}
          >
            <Text variant="titleLarge" style={styles.modalTitle}>
              Confirm Subscription
            </Text>
            <Text variant="bodyLarge">
              Are you sure you want to subscribe to the {selectedPlan?.name}?
            </Text>
            
            <View style={styles.deliveryDaysSection}>
              <Text variant="titleMedium" style={styles.sectionLabel}>
                Select Delivery Days ({selectedPlan?.mealsPerWeek} days)
              </Text>
              <View style={styles.daysContainer}>
                {DAYS_OF_WEEK.map((day) => (
                  <Chip
                    key={day.id}
                    selected={selectedDays.includes(day.id)}
                    onPress={() => handleDayToggle(day.id)}
                    style={styles.dayChip}
                    mode="outlined"
                    disabled={!selectedDays.includes(day.id) && 
                      selectedDays.length >= (selectedPlan?.mealsPerWeek || 0)}
                  >
                    {day.label}
                  </Chip>
                ))}
              </View>
            </View>

            <View style={styles.pricingDetails}>
              <Text variant="bodyMedium">Plan Price:</Text>
              <Text variant="bodyMedium">
                ${selectedPlan?.price}/2 weeks
              </Text>
            </View>

            <View style={styles.deliveryOption}>
              <View style={styles.deliveryOptionHeader}>
                <Text variant="bodyLarge" style={styles.deliveryTitle}>
                  Premium Delivery
                </Text>
                <Text variant="bodyMedium" style={styles.deliveryPrice}>
                  $4/day
                </Text>
              </View>
              <Text variant="bodyMedium" style={styles.deliveryDescription}>
                Get priority delivery, flexible delivery times, and real-time tracking
              </Text>
              <Button
                mode={includePremiumDelivery ? "contained" : "outlined"}
                onPress={() => setIncludePremiumDelivery(!includePremiumDelivery)}
                style={styles.deliveryButton}
              >
                {includePremiumDelivery ? 'Remove' : 'Add'} Premium Delivery
              </Button>
            </View>

            <View style={styles.totalSection}>
              <Text variant="titleMedium">Total:</Text>
              <Text variant="titleLarge" style={styles.totalPrice}>
                ${calculateTotal()}/2 weeks
              </Text>
            </View>

            <View style={styles.modalButtons}>
              <Button
                mode="outlined"
                onPress={() => setShowPlanConfirmation(false)}
                style={styles.modalButton}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleConfirmPlan}
                style={styles.modalButton}
              >
                Proceed to Checkout
              </Button>
            </View>
          </Modal>
        </Portal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerContent: {
    flex: 1,
  },
  welcomeText: {
    color: '#666',
    marginBottom: 4,
  },
  signOutButton: {
    borderColor: '#ff5252',
  },
  signOutButtonLabel: {
    color: '#ff5252',
  },
  sectionTitle: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    color: '#424242',
  },
  divider: {
    height: 8,
    backgroundColor: '#f5f5f5',
  },
  plansList: {
    padding: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  error: {
    color: 'red',
    padding: 16,
    textAlign: 'center',
  },
  editableText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  modal: {
    backgroundColor: 'white',
    padding: 24,
    margin: 20,
    borderRadius: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalTitle: {
    marginBottom: 20,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 24,
  },
  modalButton: {
    minWidth: 100,
  },
  settingsSection: {
    backgroundColor: '#fff',
    marginHorizontal: 12,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  settingsItem: {
    paddingVertical: 12,
  },
  modalPrice: {
    marginTop: 8,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  deliveryOption: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  deliveryOptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  deliveryTitle: {
    fontWeight: 'bold',
  },
  deliveryPrice: {
    color: '#666',
  },
  deliveryDescription: {
    color: '#666',
    marginBottom: 16,
  },
  deliveryButton: {
    marginTop: 8,
  },
  pricingDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  totalPrice: {
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  deliveryDaysSection: {
    marginTop: 24,
    marginBottom: 16,
  },
  sectionLabel: {
    marginBottom: 12,
    color: '#424242',
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayChip: {
    marginBottom: 8,
  },
}); 