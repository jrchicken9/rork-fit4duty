import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import CPPDashboard from '@/components/CPPDashboard';
import Colors from '@/constants/colors';

export default function CPPTestScreen() {
  const handleStepPress = (stepId: string) => {
    console.log('Step pressed:', stepId);
  };

  const handleCategoryPress = (category: string) => {
    console.log('Category pressed:', category);
  };

  const handleRecommendationPress = (recommendationId: string) => {
    console.log('Recommendation pressed:', recommendationId);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'CPP Data Compilation',
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: Colors.white,
          headerTitleStyle: { fontWeight: '600' }
        }} 
      />
      
      <CPPDashboard
        onStepPress={handleStepPress}
        onCategoryPress={handleCategoryPress}
        onRecommendationPress={handleRecommendationPress}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});