import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, List, FAB, Divider, Button, IconButton, Portal, Dialog, RadioButton } from 'react-native-paper';
import { useAuth } from '../../hooks/useAuth';
import { AddressForm } from '../../components/forms/AddressForm';

export default function AddressBook() {
  const { user, updateProfile } = useAuth();
  const [editingAddress, setEditingAddress] = useState<any>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [addressType, setAddressType] = useState<'delivery' | 'billing'>('delivery');

  const addresses = user?.user_metadata?.addresses || [];

  const handleSave = async (address: any) => {
    try {
      const updatedAddresses = editingAddress
        ? addresses.map((a: any) => (a === editingAddress ? { ...address, type: addressType } : a))
        : [...addresses, { ...address, type: addressType }];

      await updateProfile({ addresses: updatedAddresses });
      setEditingAddress(null);
      setShowAddDialog(false);
    } catch (error) {
      console.error('Failed to save address:', error);
      alert('Failed to save address');
    }
  };

  const handleDelete = async (address: any) => {
    try {
      const updatedAddresses = addresses.filter((a: any) => a !== address);
      await updateProfile({ addresses: updatedAddresses });
    } catch (error) {
      console.error('Failed to delete address:', error);
      alert('Failed to delete address');
    }
  };

  const handleAdd = () => {
    setShowAddDialog(true);
  };

  const handleConfirmAdd = () => {
    setShowAddDialog(false);
    setEditingAddress({});
  };

  return (
    <View style={styles.container}>
      <Text variant="titleLarge" style={styles.title}>Address Book</Text>
      
      <List.Section style={styles.addressList}>
        {/* Default Address */}
        <List.Item
          title="Home"
          description={user?.user_metadata?.address || 'No address set'}
          left={props => <List.Icon {...props} icon="home" />}
          right={props => <List.Icon {...props} icon="pencil" />}
          onPress={() => {/* Handle edit */}}
          style={styles.addressItem}
        />
        <Divider />
        {/* Additional addresses would be listed here */}
      </List.Section>

      {!editingAddress && (
        <Button
          mode="contained"
          onPress={handleAdd}
          style={styles.addButton}
          icon="plus"
        >
          Add New Address
        </Button>
      )}

      {editingAddress ? (
        <AddressForm
          initialAddress={editingAddress}
          onSave={handleSave}
          onCancel={() => setEditingAddress(null)}
        />
      ) : (
        addresses.map((address: any, index: number) => (
          <List.Item
            key={index}
            title={`${address.street}, ${address.city}`}
            description={`${address.type === 'delivery' ? '🚚 Delivery' : '💳 Billing'} • ${address.state}, ${address.zipCode}`}
            left={props => <List.Icon {...props} icon="map-marker" />}
            right={props => (
              <View style={styles.actions}>
                <IconButton
                  {...props}
                  icon="pencil"
                  onPress={() => setEditingAddress(address)}
                />
                <IconButton
                  {...props}
                  icon="delete"
                  onPress={() => handleDelete(address)}
                />
              </View>
            )}
            style={styles.addressItem}
          />
        ))
      )}

      <Portal>
        <Dialog visible={showAddDialog} onDismiss={() => setShowAddDialog(false)}>
          <Dialog.Title>Address Type</Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group onValueChange={value => setAddressType(value as 'delivery' | 'billing')} value={addressType}>
              <RadioButton.Item label="Delivery Address" value="delivery" />
              <RadioButton.Item label="Billing Address" value="billing" />
            </RadioButton.Group>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowAddDialog(false)}>Cancel</Button>
            <Button onPress={handleConfirmAdd}>Continue</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  title: {
    padding: 16,
    paddingBottom: 8,
    color: '#424242',
  },
  addressList: {
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginTop: 8,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  addressItem: {
    paddingVertical: 12,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  addButton: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  actions: {
    flexDirection: 'row',
  },
}); 