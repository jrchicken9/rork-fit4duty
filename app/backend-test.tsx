import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { trpc } from '@/lib/trpc';

export default function BackendTestPage() {
  const [name, setName] = useState<string>('');
  const [result, setResult] = useState<string>('');

  // Test status query
  const statusQuery = trpc.status.useQuery();

  const hiMutation = trpc.hi.useMutation({
    onSuccess: (data: { message: string }) => {
      setResult(data.message);
    },
    onError: (error: any) => {
      Alert.alert('Error', error.message);
    },
  });

  const handleSubmit = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a name');
      return;
    }
    hiMutation.mutate({ name: name.trim() });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Backend Test</Text>
      <Text style={styles.subtitle}>Test the tRPC connection</Text>
      
      {/* Backend Status */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusTitle}>Backend Status:</Text>
        {statusQuery.isLoading ? (
          <Text style={styles.statusText}>Checking...</Text>
        ) : statusQuery.error ? (
          <Text style={[styles.statusText, styles.errorText]}>❌ Error: {statusQuery.error.message}</Text>
        ) : statusQuery.data ? (
          <Text style={[styles.statusText, styles.successText]}>✅ {statusQuery.data.status}</Text>
        ) : null}
      </View>
      
      <TextInput
        style={styles.input}
        placeholder="Enter your name"
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
      />
      
      <TouchableOpacity
        style={[styles.button, hiMutation.isPending && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={hiMutation.isPending}
      >
        <Text style={styles.buttonText}>
          {hiMutation.isPending ? 'Sending...' : 'Say Hi to Backend'}
        </Text>
      </TouchableOpacity>
      
      {result ? (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Response:</Text>
          <Text style={styles.resultText}>{result}</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 20,
    justifyContent: 'center',
    minHeight: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    color: '#666',
  },
  statusContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  statusText: {
    fontSize: 14,
    color: '#666',
  },
  successText: {
    color: '#28a745',
  },
  errorText: {
    color: '#dc3545',
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  resultContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  resultText: {
    fontSize: 14,
    color: '#666',
  },
});