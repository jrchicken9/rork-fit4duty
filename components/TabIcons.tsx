import React from 'react';
import { View, StyleSheet } from 'react-native';
import { 
  Home, 
  FileText, 
  Dumbbell, 
  Users, 
  User,
  Target,
  Shield,
  Heart,
  Star
} from 'lucide-react-native';
import Colors from '@/constants/colors';

interface TabIconProps {
  name: 'dashboard' | 'application' | 'fitness' | 'community' | 'profile';
  focused: boolean;
  size?: number;
}

export default function TabIcon({ name, focused, size = 24 }: TabIconProps) {
  const iconColor = focused ? Colors.primary : Colors.textSecondary;
  const bgColor = focused ? Colors.primary + '12' : 'transparent';

  const renderIcon = () => {
    switch (name) {
      case 'dashboard':
        return (
          <View style={[styles.iconContainer, { 
            backgroundColor: bgColor,
            borderColor: focused ? Colors.primary + '25' : 'transparent',
            transform: focused ? [{ scale: 1.05 }] : [{ scale: 1 }]
          }]}>
            <Home size={size} color={iconColor} strokeWidth={focused ? 2.5 : 2} />
            {focused && <View style={[styles.activeIndicator, { backgroundColor: Colors.primary }]} />}
          </View>
        );
      
      case 'application':
        return (
          <View style={[styles.iconContainer, { 
            backgroundColor: bgColor,
            borderColor: focused ? Colors.accent + '25' : 'transparent',
            transform: focused ? [{ scale: 1.05 }] : [{ scale: 1 }]
          }]}>
            <View style={styles.applicationIcon}>
              <FileText size={size * 0.8} color={iconColor} strokeWidth={focused ? 2.5 : 2} />
              <Target size={size * 0.4} color={Colors.accent} style={styles.overlayIcon} />
            </View>
            {focused && <View style={[styles.activeIndicator, { backgroundColor: Colors.accent }]} />}
          </View>
        );
      
      case 'fitness':
        return (
          <View style={[styles.iconContainer, { 
            backgroundColor: bgColor,
            borderColor: focused ? Colors.success + '25' : 'transparent',
            transform: focused ? [{ scale: 1.05 }] : [{ scale: 1 }]
          }]}>
            <View style={styles.fitnessIcon}>
              <Dumbbell size={size * 0.8} color={iconColor} strokeWidth={focused ? 2.5 : 2} />
              <Heart size={size * 0.4} color={Colors.success} style={styles.overlayIcon} />
            </View>
            {focused && <View style={[styles.activeIndicator, { backgroundColor: Colors.success }]} />}
          </View>
        );
      
      case 'community':
        return (
          <View style={[styles.iconContainer, { 
            backgroundColor: bgColor,
            borderColor: focused ? Colors.warning + '25' : 'transparent',
            transform: focused ? [{ scale: 1.05 }] : [{ scale: 1 }]
          }]}>
            <View style={styles.communityIcon}>
              <Users size={size * 0.8} color={iconColor} strokeWidth={focused ? 2.5 : 2} />
              <Star size={size * 0.4} color={Colors.warning} style={styles.overlayIcon} />
            </View>
            {focused && <View style={[styles.activeIndicator, { backgroundColor: Colors.warning }]} />}
          </View>
        );
      
      case 'profile':
        return (
          <View style={[styles.iconContainer, { 
            backgroundColor: bgColor,
            borderColor: focused ? Colors.secondary + '25' : 'transparent',
            transform: focused ? [{ scale: 1.05 }] : [{ scale: 1 }]
          }]}>
            <View style={styles.profileIcon}>
              <User size={size * 0.8} color={iconColor} strokeWidth={focused ? 2.5 : 2} />
              <Shield size={size * 0.4} color={Colors.secondary} style={styles.overlayIcon} />
            </View>
            {focused && <View style={[styles.activeIndicator, { backgroundColor: Colors.secondary }]} />}
          </View>
        );
      
      default:
        return <Home size={size} color={iconColor} />;
    }
  };

  return renderIcon();
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    padding: 8,
    position: 'relative',
    minWidth: 48,
    minHeight: 48,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  applicationIcon: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fitnessIcon: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  communityIcon: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileIcon: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayIcon: {
    position: 'absolute',
    bottom: -2,
    right: -2,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -4,
    width: 6,
    height: 6,
    borderRadius: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
});
