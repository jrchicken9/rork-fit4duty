import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { router, useSegments } from 'expo-router';

export default function FirstSignInHandler() {
  const { user, isLoading, shouldShowCPPPreview } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    // Don't redirect while loading
    if (isLoading) return;

    // Don't redirect if no user
    if (!user) return;

    // Don't redirect if already on auth screens
    const isOnAuthScreen = segments[0] === 'auth' || segments[0] === 'index';
    if (isOnAuthScreen) return;

    // Don't redirect if already on CPP screens
    const isOnCPPScreen = segments[0] === 'cpp-preview' || segments[0] === 'cpp-setup';
    if (isOnCPPScreen) return;

    // Check if user should see CPP preview
    if (shouldShowCPPPreview()) {
      console.log('First sign-in detected, redirecting to CPP preview');
      router.replace('/cpp-preview');
    }
  }, [user, isLoading, shouldShowCPPPreview, segments]);

  // This component doesn't render anything
  return null;
}

