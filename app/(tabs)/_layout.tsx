import { Tabs } from "expo-router";
import React, { useState } from "react";
import { View, TouchableOpacity, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "@/constants/colors";
import Logo from "@/components/Logo";
import NotificationBell from "@/components/NotificationBell";
import NotificationPanel from "@/components/NotificationPanel";
import TabIcon from "@/components/TabIcons";
import CPPOnboardingRibbon from "@/components/CPPOnboardingRibbon";
import { shadows, spacing } from "@/constants/designSystem";

export default function TabLayout() {
  const [notificationPanelVisible, setNotificationPanelVisible] = useState(false);

  return (
    <>
      <CPPOnboardingRibbon />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: Colors.textSecondary,
          headerShown: true,
          tabBarStyle: {
            backgroundColor: Colors.white,
            borderTopWidth: 0,
            paddingTop: spacing.sm,
            paddingBottom: Platform.OS === 'ios' ? spacing.lg : spacing.md,
            height: Platform.OS === 'ios' ? 88 : 68,
            ...shadows.medium,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
            marginTop: 4,
          },
          headerStyle: {
            backgroundColor: 'transparent',
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 0,
          },
          headerBackground: () => (
            <LinearGradient
              colors={[Colors.gradients.primary.start, Colors.gradients.primary.end]}
              style={{ flex: 1 }}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          ),
          headerTintColor: Colors.white,
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: 18,
          },
          headerTitle: () => (
            <Logo size="small" variant="light" showText={true} />
          ),
          headerRight: () => (
            <View style={{ marginRight: spacing.md }}>
              <NotificationBell
                onPress={() => setNotificationPanelVisible(true)}
                size={24}
                showBadge={true}
              />
            </View>
          ),
        }}
      >
        <Tabs.Screen
          name="dashboard"
          options={{
            title: "Dashboard",
            tabBarIcon: ({ focused }) => <TabIcon name="dashboard" focused={focused} size={24} />,
            headerTitle: () => (
              <Logo size="small" variant="light" showText={true} />
            ),
          }}
        />
        <Tabs.Screen
          name="application"
          options={{
            title: "Application",
            tabBarIcon: ({ focused }) => <TabIcon name="application" focused={focused} size={24} />,
          }}
        />
        <Tabs.Screen
          name="fitness"
          options={{
            title: "Fitness",
            tabBarIcon: ({ focused }) => <TabIcon name="fitness" focused={focused} size={24} />,
          }}
        />
        <Tabs.Screen
          name="community"
          options={{
            title: "Community",
            tabBarIcon: ({ focused }) => <TabIcon name="community" focused={focused} size={24} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ focused }) => <TabIcon name="profile" focused={focused} size={24} />,
          }}
        />
      </Tabs>

      {/* Global Notification Panel */}
      <NotificationPanel
        visible={notificationPanelVisible}
        onClose={() => setNotificationPanelVisible(false)}
      />
    </>
  );
}