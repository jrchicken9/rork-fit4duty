import { Tabs } from "expo-router";
import React, { useState } from "react";
import Colors from "@/constants/colors";
import Logo from "@/components/Logo";
import NotificationBell from "@/components/NotificationBell";
import NotificationPanel from "@/components/NotificationPanel";
import TabIcon from "@/components/TabIcons";
import CPPOnboardingRibbon from "@/components/CPPOnboardingRibbon";
import { View, TouchableOpacity } from "react-native";

export default function TabLayout() {
  const [notificationPanelVisible, setNotificationPanelVisible] = useState(false);

  return (
    <>
      <CPPOnboardingRibbon />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors.primary,
          headerShown: true,
          tabBarStyle: {
            backgroundColor: Colors.background,
            borderTopColor: Colors.border,
          },
          headerStyle: {
            backgroundColor: Colors.primary,
          },
          headerTintColor: Colors.white,
          headerTitleStyle: {
            fontWeight: "bold",
          },
          headerTitle: () => (
            <Logo size="small" variant="light" showText={false} />
          ),
          headerRight: () => (
            <View style={{ marginRight: 16 }}>
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
            tabBarIcon: ({ focused }) => <TabIcon name="dashboard" focused={focused} size={22} />,
            headerTitle: () => (
              <Logo size="small" variant="light" />
            ),
          }}
        />
        <Tabs.Screen
          name="application"
          options={{
            title: "Application",
            tabBarIcon: ({ focused }) => <TabIcon name="application" focused={focused} size={22} />,
          }}
        />
        <Tabs.Screen
          name="fitness"
          options={{
            title: "Fitness",
            tabBarIcon: ({ focused }) => <TabIcon name="fitness" focused={focused} size={22} />,
          }}
        />
        <Tabs.Screen
          name="community"
          options={{
            title: "Community",
            tabBarIcon: ({ focused }) => <TabIcon name="community" focused={focused} size={22} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ focused }) => <TabIcon name="profile" focused={focused} size={22} />,
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