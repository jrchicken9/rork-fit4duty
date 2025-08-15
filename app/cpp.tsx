import React from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { RefreshCw } from 'lucide-react-native';
import CPPDashboard from '@/components/CPPDashboard';
import Colors from '@/constants/colors';
import { useCPPData } from '@/hooks/useCPPData';
import LoadingScreen from '@/components/LoadingScreen';
import ErrorMessage from '@/components/ErrorMessage';
import { typography, spacing, borderRadius } from '@/constants/designSystem';

export default function CPPScreen() {
  const { data, isLoading, error, refresh } = useCPPData({ autoRefresh: true });

  const handleStepPress = (stepId: string) => {
    console.log('Step pressed:', stepId);
    // Navigate to specific step or action
    // This could route to different screens based on step type
  };

  const handleCategoryPress = (category: string) => {
    console.log('Category pressed:', category);
    // Could filter the view or navigate to category-specific screen
  };

  const handleRecommendationPress = (recommendationId: string) => {
    console.log('Recommendation pressed:', recommendationId);
    
    // Handle different recommendation actions
    const recommendation = data?.recommendations.find(r => r.id === recommendationId);
    if (!recommendation) return;
    
    switch (recommendation.action) {
      case 'subscribe':
        router.push('/subscription');
        break;
      case 'book_session':
        router.push('/practice-sessions');
        break;
      case 'complete_steps':
        if (recommendation.stepId) {
          handleStepPress(recommendation.stepId);
        }
        break;
      default:
        console.log('Unknown recommendation action:', recommendation.action);
    }
  };

  if (isLoading && !data) {
    return <LoadingScreen title="Loading CPP Data" subtitle="Compiling your progress..." />;
  }

  if (error && !data) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen 
          options={{ 
            title: 'Certified Preparation Progress',
            headerStyle: { backgroundColor: Colors.primary },
            headerTintColor: Colors.white,
            headerTitleStyle: { fontWeight: '600' }
          }} 
        />
        <View style={styles.errorContainer}>
          <ErrorMessage 
            message={error} 
            type="error" 
          />
          <TouchableOpacity style={styles.retryButton} onPress={refresh}>
            <RefreshCw size={16} color={Colors.white} />
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Certified Preparation Progress',
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: Colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
  },
  retryButtonText: {
    ...typography.labelLarge,
    color: Colors.white,
    fontWeight: '600',
  },
});

