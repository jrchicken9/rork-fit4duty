import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  Dimensions,
  Animated,
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { 
  User, 
  Calendar, 
  Award, 
  LogOut, 
  Settings, 
  Edit3, 
  MapPin, 
  Phone, 
  Mail,
  Target,
  Clock,
  Activity,
  Shield,
  Camera,
  Lock,
  Key,
  UserCheck,
  Bell,
  Plus,
  HelpCircle,
  MessageCircle,
  FileText,
  BarChart3,
  Users,
  XCircle,
  AlertCircle,
  Dumbbell,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Star,
  Zap,
  Heart,
  Trophy,
  BookOpen,
  TrendingUp,
  MoreHorizontal,
  Share2,
  Bookmark,
  Eye
} from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { typography, spacing, borderRadius, shadows } from "@/constants/designSystem";
import Button from "@/components/Button";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/context/NotificationContext";
import { useCPP } from "@/context/CPPContext";
import NotificationBell from "@/components/NotificationBell";
import NotificationPanel from "@/components/NotificationPanel";
import CPPProgressWidget from "@/components/CPPProgressWidget";
import { router } from "expo-router";
import { supabase } from "@/lib/supabase";
import Logo from "@/components/Logo";

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const { user, signOut, updateProfile: updateAuthProfile, isLoading, isAdmin } = useAuth();
  const { unreadCount } = useNotifications();
  const { progress } = useCPP();
  
  const [notificationPanelVisible, setNotificationPanelVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Animation values
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);
  
  // Profile form state
  const [name, setName] = useState(user?.full_name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [location, setLocation] = useState(user?.location || "");
  const [goal, setGoal] = useState(user?.goal || "");
  const [targetDate, setTargetDate] = useState(user?.target_date || "");
  const [experienceLevel, setExperienceLevel] = useState(user?.experience_level || "beginner");

  const isPremium = false; // Subscription removed - ready for new implementation

  // Mock data for progress tracking
  const userProgress = {
    applicationSteps: 3,
    totalSteps: 8,
    fitnessLevel: "Intermediate",
    beepTestLevel: 5.2,
    targetLevel: 6.5,
    upcomingSessions: 2,
    completedWorkouts: 12,
    weeklyGoal: 3,
    currentStreak: 5,
    profileCompletion: 65
  };

  useEffect(() => {
    // Animate in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };



  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateAuthProfile({
        full_name: name,
        phone,
        location,
        goal,
        target_date: targetDate,
        experience_level: experienceLevel,
      });
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setName(user?.full_name || "");
    setPhone(user?.phone || "");
    setLocation(user?.location || "");
    setGoal(user?.goal || "");
    setTargetDate(user?.target_date || "");
    setExperienceLevel(user?.experience_level || "beginner");
    setIsEditing(false);
  };

  const handlePasswordReset = () => {
    Alert.alert('Password Reset', 'Password reset link sent to your email');
  };

  const handleContactSupport = () => {
    Alert.alert('Contact Support', 'Support contact information coming soon');
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: signOut },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Section - Inspired by LinkedIn/Instagram */}
        <View style={styles.heroSection}>
          <LinearGradient
            colors={[Colors.primary, Colors.primary + 'DD']}
            style={styles.heroGradient}
          >
            {/* Header Actions */}
            <View style={styles.heroHeader}>
              <TouchableOpacity 
                style={styles.notificationButton} 
                onPress={() => setNotificationPanelVisible(true)}
              >
                <NotificationBell size={24} onPress={() => setNotificationPanelVisible(true)} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.moreButton}>
                <MoreHorizontal size={24} color={Colors.white} />
              </TouchableOpacity>
            </View>

            {/* Profile Picture & Basic Info */}
            <View style={styles.profileHero}>
              <View style={styles.profilePictureContainer}>
                <View style={styles.profilePicture}>
                  <User size={40} color={Colors.white} />
                </View>

                <TouchableOpacity style={styles.editPictureButton}>
                  <Camera size={16} color={Colors.primary} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{name || 'Your Name'}</Text>
                <Text style={styles.profileSubtitle}>Police Officer Candidate</Text>
                <View style={styles.profileMeta}>
                  <MapPin size={14} color={Colors.white + 'CC'} />
                  <Text style={styles.profileLocation}>{location || 'Location not set'}</Text>
                </View>
              </View>
            </View>

            {/* CPP Progress Bar */}
            <View style={styles.completionSection}>
              <View style={styles.completionHeader}>
                <Text style={styles.completionTitle}>CPP Progress</Text>
                <Text style={styles.completionPercentage}>{Math.round(progress.percentage)}%</Text>
              </View>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${progress.percentage}%` }
                  ]} 
                />
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* CPP Progress Widget */}
        <CPPProgressWidget 
          onPress={() => router.push('/cpp')}
          compact={true}
        />

        {/* Quick Stats Cards - Inspired by fitness apps */}
        <View style={styles.statsSection}>
          <View style={styles.statsGrid}>
            <TouchableOpacity style={styles.statCard} onPress={() => router.push('/(tabs)/application')}>
              <View style={styles.statIcon}>
                <Target size={20} color={Colors.primary} />
              </View>
              <Text style={styles.statNumber}>{userProgress.applicationSteps}/{userProgress.totalSteps}</Text>
              <Text style={styles.statLabel}>Application Steps</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.statCard} onPress={() => router.push('/(tabs)/fitness')}>
              <View style={styles.statIcon}>
                <Dumbbell size={20} color={Colors.success} />
              </View>
              <Text style={styles.statNumber}>{userProgress.beepTestLevel.toFixed(1)}/{userProgress.targetLevel}</Text>
              <Text style={styles.statLabel}>Beep Test Level</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.statCard} onPress={() => router.push('/practice-sessions')}>
              <View style={styles.statIcon}>
                <Calendar size={20} color={Colors.warning} />
              </View>
              <Text style={styles.statNumber}>{userProgress.upcomingSessions}</Text>
              <Text style={styles.statLabel}>Upcoming Sessions</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.statCard} onPress={() => router.push('/cpp')}>
              <View style={styles.statIcon}>
                <Award size={20} color={Colors.primary} />
              </View>
              <Text style={styles.statNumber}>{progress.verifiedCompletions}/{progress.unverifiedCompletions}</Text>
              <Text style={styles.statLabel}>Verified/Unverified</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Content Cards */}
        <View style={styles.contentSection}>
          {/* Personal Information Card */}
          <View style={styles.contentCard}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleSection}>
                <User size={20} color={Colors.primary} />
                <Text style={styles.cardTitle}>Personal Information</Text>
              </View>
              <TouchableOpacity 
                style={styles.editButton} 
                onPress={() => setIsEditing(true)}
              >
                <Edit3 size={16} color={Colors.primary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.infoList}>
              <View style={styles.infoRow}>
                <Mail size={16} color={Colors.textSecondary} />
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{email}</Text>
              </View>
              <View style={styles.infoRow}>
                <Phone size={16} color={Colors.textSecondary} />
                <Text style={styles.infoLabel}>Phone</Text>
                <Text style={styles.infoValue}>{phone || 'Not set'}</Text>
              </View>
              <View style={styles.infoRow}>
                <MapPin size={16} color={Colors.textSecondary} />
                <Text style={styles.infoLabel}>Location</Text>
                <Text style={styles.infoValue}>{location || 'Not set'}</Text>
              </View>
            </View>
          </View>

          {/* Goals & Progress Card */}
          <View style={styles.contentCard}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleSection}>
                <Target size={20} color={Colors.primary} />
                <Text style={styles.cardTitle}>Goals & Progress</Text>
              </View>
              <TouchableOpacity style={styles.viewAllButton}>
                <Text style={styles.viewAllText}>View All</Text>
                <ChevronRight size={16} color={Colors.primary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.goalSection}>
              <Text style={styles.goalTitle}>Current Goal</Text>
              <Text style={styles.goalText}>{goal || 'No goal set'}</Text>
              {targetDate && (
                <Text style={styles.goalDate}>Target: {targetDate}</Text>
              )}
            </View>

            <View style={styles.fitnessSection}>
              <Text style={styles.sectionTitle}>Fitness Profile</Text>
              <View style={styles.fitnessStats}>
                <View style={styles.fitnessStat}>
                  <Text style={styles.fitnessStatLabel}>Experience</Text>
                  <Text style={styles.fitnessStatValue}>{experienceLevel.charAt(0).toUpperCase() + experienceLevel.slice(1)}</Text>
                </View>
                <View style={styles.fitnessStat}>
                  <Text style={styles.fitnessStatLabel}>Workouts</Text>
                  <Text style={styles.fitnessStatValue}>{userProgress.completedWorkouts}</Text>
                </View>
                <View style={styles.fitnessStat}>
                  <Text style={styles.fitnessStatLabel}>Weekly Goal</Text>
                  <Text style={styles.fitnessStatValue}>{userProgress.weeklyGoal}</Text>
                </View>
              </View>
            </View>
          </View>



          {/* Settings Card */}
          <View style={styles.contentCard}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleSection}>
                <Settings size={20} color={Colors.primary} />
                <Text style={styles.cardTitle}>Settings</Text>
              </View>
            </View>
            
            <View style={styles.settingsList}>
              <TouchableOpacity style={styles.settingItem} onPress={handlePasswordReset}>
                <Key size={20} color={Colors.primary} />
                <View style={styles.settingContent}>
                  <Text style={styles.settingTitle}>Reset Password</Text>
                  <Text style={styles.settingDescription}>Send password reset link to your email</Text>
                </View>
                <ChevronRight size={16} color={Colors.textSecondary} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.settingItem} onPress={handleContactSupport}>
                <HelpCircle size={20} color={Colors.primary} />
                <View style={styles.settingContent}>
                  <Text style={styles.settingTitle}>Help & Support</Text>
                  <Text style={styles.settingDescription}>Contact our support team</Text>
                </View>
                <ChevronRight size={16} color={Colors.textSecondary} />
              </TouchableOpacity>

              {isAdmin() && (
                <TouchableOpacity 
                  style={styles.settingItem} 
                  onPress={() => router.push('/admin/dashboard')}
                >
                  <Shield size={20} color={Colors.primary} />
                  <View style={styles.settingContent}>
                    <Text style={styles.settingTitle}>Admin Panel</Text>
                    <Text style={styles.settingDescription}>Access administrative tools</Text>
                  </View>
                  <ChevronRight size={16} color={Colors.textSecondary} />
                </TouchableOpacity>
              )}

              <TouchableOpacity style={[styles.settingItem, styles.dangerItem]} onPress={handleSignOut}>
                <LogOut size={20} color={Colors.error} />
                <View style={styles.settingContent}>
                  <Text style={[styles.settingTitle, styles.dangerText]}>Sign Out</Text>
                  <Text style={styles.settingDescription}>Sign out of your account</Text>
                </View>
                <ChevronRight size={16} color={Colors.error} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Edit Profile Form */}
        {isEditing && (
          <View style={styles.editModal}>
            <View style={styles.editModalContent}>
              <View style={styles.editModalHeader}>
                <Text style={styles.editModalTitle}>Edit Profile</Text>
                <TouchableOpacity onPress={() => setIsEditing(false)}>
                  <XCircle size={24} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.editForm} showsVerticalScrollIndicator={false}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Full Name</Text>
                  <View style={styles.inputContainer}>
                    <User size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      value={name}
                      onChangeText={setName}
                      placeholder="Enter your full name"
                      placeholderTextColor={Colors.gray[400]}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Phone Number</Text>
                  <View style={styles.inputContainer}>
                    <Phone size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      value={phone}
                      onChangeText={setPhone}
                      placeholder="(555) 123-4567"
                      placeholderTextColor={Colors.gray[400]}
                      keyboardType="phone-pad"
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Location</Text>
                  <View style={styles.inputContainer}>
                    <MapPin size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      value={location}
                      onChangeText={setLocation}
                      placeholder="City, Province"
                      placeholderTextColor={Colors.gray[400]}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Your Goal</Text>
                  <View style={styles.inputContainer}>
                    <Target size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      value={goal}
                      onChangeText={setGoal}
                      placeholder="e.g., Pass PREP test by December"
                      placeholderTextColor={Colors.gray[400]}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Target Date</Text>
                  <View style={styles.inputContainer}>
                    <Calendar size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      value={targetDate}
                      onChangeText={setTargetDate}
                      placeholder="MM/YYYY"
                      placeholderTextColor={Colors.gray[400]}
                    />
                  </View>
                </View>

                <View style={styles.editActions}>
                  <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <Button
                    title="Save Changes"
                    onPress={handleSave}
                    loading={isSaving}
                    style={styles.saveButton}
                  />
                </View>
              </ScrollView>
            </View>
          </View>
        )}

        {/* Spacer */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Global Notification Panel */}
      <NotificationPanel
        visible={notificationPanelVisible}
        onClose={() => setNotificationPanelVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  
  // Hero section styles - Inspired by LinkedIn/Instagram
  heroSection: {
    height: width * 1.2,
    marginBottom: 20,
  },
  heroGradient: {
    flex: 1,
    borderRadius: 20,
    padding: 20,
    position: 'relative',
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    zIndex: 1,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Profile hero content
  profileHero: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 60,
    position: 'relative',
  },
  profilePictureContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  profilePicture: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },

  editPictureButton: {
    position: 'absolute',
    bottom: -10,
    right: -10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  profileInfo: {
    marginLeft: 20,
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 4,
  },
  profileSubtitle: {
    fontSize: 16,
    color: Colors.white + 'CC',
    marginBottom: 8,
  },
  profileMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  profileLocation: {
    fontSize: 14,
    color: Colors.white + 'CC',
  },
  
  // Profile completion section
  completionSection: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    zIndex: 1,
  },
  completionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  completionTitle: {
    fontSize: 14,
    color: Colors.white,
    fontWeight: '600',
  },
  completionPercentage: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.white,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.white + '20',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.white,
    borderRadius: 4,
  },
  
  // Quick stats section - Inspired by fitness apps
  statsSection: {
    backgroundColor: Colors.white,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    ...shadows.light,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 8,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  
  // Main content cards
  contentSection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  contentCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    ...shadows.light,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  editButton: {
    padding: 8,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  
  // Info list styles
  infoList: {
    marginTop: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    width: 80,
    marginLeft: 12,
  },
  infoValue: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
  },
  
  // Goal and Fitness sections
  goalSection: {
    marginBottom: 16,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  goalText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  goalDate: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  fitnessSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  fitnessStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  fitnessStat: {
    alignItems: 'center',
  },
  fitnessStatLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  fitnessStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  

  
  // Settings styles
  settingsList: {
    marginTop: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingContent: {
    flex: 1,
    marginLeft: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  dangerItem: {
    borderColor: '#EF444430',
  },
  dangerText: {
    color: Colors.error,
  },
  
  // Edit modal styles
  editModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  editModalContent: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    width: '90%',
    maxHeight: '80%',
    ...shadows.heavy,
  },
  editModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  editModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  editForm: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.background,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  saveButton: {
    flex: 2,
  },
  
  // Spacer
  bottomSpacer: {
    height: 100,
  },
});