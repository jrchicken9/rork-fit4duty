import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider } from "@/context/AuthContext";
import { FitnessProvider } from "@/context/FitnessContext";
import { ApplicationProvider } from "@/context/ApplicationContext";
import { CommunityProvider } from "@/context/CommunityContext";
import { SubscriptionProvider } from "@/context/SubscriptionContext";
import { CPPProvider } from "@/context/CPPContext";
import { PinTestProvider } from "@/context/PinTestContext";
import { PracticeTestsProvider } from "@/context/PracticeTestsContext";
import { PracticeSessionsProvider } from "@/context/PracticeSessionsContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import StripeProvider from "@/components/StripeProvider";
import FirstSignInHandler from "@/components/FirstSignInHandler";
import { trpc, trpcClient } from "@/lib/trpc";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

function RootLayoutNav() {
  return (
    <>
      <FirstSignInHandler />
      <Stack screenOptions={{ headerBackTitle: "Back" }}>
      {/* Welcome/Auth Flow */}
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="auth/sign-in"
        options={{
          title: "Sign In",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="auth/sign-up"
        options={{
          title: "Sign Up",
          headerShown: false,
        }}
      />
      
      {/* Main App Tabs */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      
      {/* Core Features */}
      <Stack.Screen name="workout/[id]" options={{ title: "Workout" }} />
      <Stack.Screen name="exercise/[id]" options={{ title: "Exercise" }} />
      <Stack.Screen name="video/[id]" options={{ title: "Video Tutorial" }} />
      <Stack.Screen name="test/[id]" options={{ title: "Police Test" }} />
      <Stack.Screen name="workout/session/[id]" options={{ title: "Workout Session" }} />
      <Stack.Screen name="workout/shuttle-run" options={{ title: "Shuttle Run" }} />
      
      {/* Application Process */}
      <Stack.Screen name="application/[step]" options={{ title: "Application Step" }} />
      <Stack.Screen name="application/police-service-selection" options={{ title: "Select Police Services" }} />
      <Stack.Screen name="profile-completion" options={{ title: "Complete Profile" }} />
      
      {/* CPP System */}
      <Stack.Screen name="cpp" options={{ title: "Certified Preparation Progress" }} />
      <Stack.Screen name="cpp-preview" options={{ title: "Welcome to CPP", headerShown: false }} />
      <Stack.Screen name="cpp-setup" options={{ title: "CPP Setup", headerShown: false }} />
      
      {/* Fitness Testing */}
      <Stack.Screen name="pin-test" options={{ title: "Ontario PIN Test" }} />
      <Stack.Screen name="pin-test/results" options={{ title: "PIN Test Results" }} />
      
      {/* Practice Sessions */}
      <Stack.Screen name="practice-sessions" options={{ title: "Practice Sessions" }} />
      <Stack.Screen name="practice-sessions/[id]" options={{ title: "Session Details" }} />
      <Stack.Screen name="practice-sessions/bookings" options={{ title: "My Bookings" }} />
      <Stack.Screen name="practice-tests" options={{ title: "Practice Tests" }} />
      
      {/* Subscription */}
      <Stack.Screen name="subscription" options={{ title: "Subscription Plans" }} />
      
      {/* Admin Routes - Organized by functionality */}
      <Stack.Screen name="admin/dashboard" options={{ title: "Admin Dashboard" }} />
      <Stack.Screen name="admin/users" options={{ title: "User Management" }} />
      <Stack.Screen name="admin/analytics" options={{ title: "Analytics" }} />
      <Stack.Screen name="admin/settings" options={{ title: "System Settings" }} />
      
      {/* Practice Session Management */}
      <Stack.Screen name="admin/practice-sessions" options={{ title: "Practice Sessions Management" }} />
      <Stack.Screen name="admin/practice-sessions/create" options={{ title: "Create Session" }} />
      <Stack.Screen name="admin/booking-approvals" options={{ title: "Booking Approvals" }} />
      <Stack.Screen name="admin/session-attendees/[id]" options={{ title: "Session Attendees" }} />
      
      {/* Community Management */}
      <Stack.Screen name="admin/community" options={{ title: "Community Management" }} />
      
      {/* Backend Test */}
      <Stack.Screen name="backend-test" options={{ title: "Backend Test" }} />
    </Stack>
      </>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <ErrorBoundary>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <SubscriptionProvider>
            <CPPProvider>
              <FitnessProvider>
                <ApplicationProvider>
                  <CommunityProvider>
                    <PinTestProvider>
                      <PracticeTestsProvider>
                        <PracticeSessionsProvider>
                          <NotificationProvider>
                            <StripeProvider>
                              <GestureHandlerRootView style={{ flex: 1 }}>
                                <RootLayoutNav />
                              </GestureHandlerRootView>
                            </StripeProvider>
                          </NotificationProvider>
                        </PracticeSessionsProvider>
                      </PracticeTestsProvider>
                    </PinTestProvider>
                  </CommunityProvider>
                </ApplicationProvider>
              </FitnessProvider>
            </CPPProvider>
          </SubscriptionProvider>
        </AuthProvider>
        </QueryClientProvider>
      </trpc.Provider>
    </ErrorBoundary>
  );
}