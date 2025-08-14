import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import {
  UserPlus,
  UserMinus,
  Shield,
  Users,
  Check,
  X,
  AlertCircle,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { supabase } from '@/lib/supabase';

interface AdminUser {
  user_id: string;
  email: string;
  full_name: string;
  role: string;
  granted_at: string;
  granted_by_email: string;
  is_active: boolean;
}

export default function AdminRoleManager() {
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [grantingRole, setGrantingRole] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<'admin' | 'session_manager'>('admin');

  useEffect(() => {
    loadAdminUsers();
  }, []);

  const loadAdminUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_admin_users');
      
      if (error) {
        console.error('Error loading admin users:', error);
        Alert.alert('Error', 'Failed to load admin users');
        return;
      }
      
      setAdminUsers(data || []);
    } catch (error: any) {
      console.error('Error:', error);
      Alert.alert('Error', 'Failed to load admin users');
    } finally {
      setLoading(false);
    }
  };

  const grantAdminRole = async () => {
    if (!newAdminEmail.trim()) {
      Alert.alert('Error', 'Please enter an email address');
      return;
    }

    try {
      setGrantingRole(true);
      const { data, error } = await supabase.rpc('grant_admin_role', {
        target_user_email: newAdminEmail.trim(),
        role_type: selectedRole,
      });

      if (error) {
        console.error('Error granting admin role:', error);
        Alert.alert('Error', error.message || 'Failed to grant admin role');
        return;
      }

      Alert.alert('Success', `${selectedRole} role granted to ${newAdminEmail}`);
      setNewAdminEmail('');
      loadAdminUsers();
    } catch (error: any) {
      console.error('Error:', error);
      Alert.alert('Error', 'Failed to grant admin role');
    } finally {
      setGrantingRole(false);
    }
  };

  const revokeAdminRole = async (email: string, role: string) => {
    Alert.alert(
      'Confirm Revocation',
      `Are you sure you want to revoke the ${role} role from ${email}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Revoke',
          style: 'destructive',
          onPress: async () => {
            try {
              const { data, error } = await supabase.rpc('revoke_admin_role', {
                target_user_email: email,
                role_type: role,
              });

              if (error) {
                console.error('Error revoking admin role:', error);
                Alert.alert('Error', error.message || 'Failed to revoke admin role');
                return;
              }

              Alert.alert('Success', `${role} role revoked from ${email}`);
              loadAdminUsers();
            } catch (error: any) {
              console.error('Error:', error);
              Alert.alert('Error', 'Failed to revoke admin role');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return Colors.error;
      case 'admin':
        return Colors.primary;
      case 'session_manager':
        return Colors.success;
      default:
        return Colors.textSecondary;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <Shield size={16} color={Colors.error} />;
      case 'admin':
        return <Shield size={16} color={Colors.primary} />;
      case 'session_manager':
        return <Users size={16} color={Colors.success} />;
      default:
        return <Shield size={16} color={Colors.textSecondary} />;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading admin users...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Admin Role Management</Text>
        <Text style={styles.subtitle}>
          Manage admin permissions for practice session creation
        </Text>
      </View>

      {/* Grant New Admin Role */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Grant Admin Role</Text>
        
        <View style={styles.roleSelector}>
          <TouchableOpacity
            style={[
              styles.roleButton,
              selectedRole === 'admin' && styles.roleButtonActive,
            ]}
            onPress={() => setSelectedRole('admin')}
          >
            <Shield size={16} color={selectedRole === 'admin' ? Colors.white : Colors.primary} />
            <Text style={[
              styles.roleButtonText,
              selectedRole === 'admin' && styles.roleButtonTextActive,
            ]}>
              Admin
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.roleButton,
              selectedRole === 'session_manager' && styles.roleButtonActive,
            ]}
            onPress={() => setSelectedRole('session_manager')}
          >
            <Users size={16} color={selectedRole === 'session_manager' ? Colors.white : Colors.success} />
            <Text style={[
              styles.roleButtonText,
              selectedRole === 'session_manager' && styles.roleButtonTextActive,
            ]}>
              Session Manager
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.grantForm}>
          <Text style={styles.label}>User Email</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.input}>
              {newAdminEmail || 'Enter email address'}
            </Text>
            <TouchableOpacity
              style={styles.grantButton}
              onPress={() => {
                Alert.prompt(
                  'Enter Email',
                  'Enter the email address of the user to grant admin role:',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Grant',
                      onPress: (email) => {
                        if (email) {
                          setNewAdminEmail(email);
                          grantAdminRole();
                        }
                      },
                    },
                  ],
                  'plain-text',
                  newAdminEmail
                );
              }}
              disabled={grantingRole}
            >
              {grantingRole ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <UserPlus size={16} color={Colors.white} />
              )}
              <Text style={styles.grantButtonText}>
                {grantingRole ? 'Granting...' : 'Grant Role'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Current Admin Users */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current Admin Users</Text>
        
        {adminUsers.length === 0 ? (
          <View style={styles.emptyState}>
            <AlertCircle size={48} color={Colors.textSecondary} />
            <Text style={styles.emptyStateText}>No admin users found</Text>
          </View>
        ) : (
          adminUsers.map((user) => (
            <View key={`${user.user_id}-${user.role}`} style={styles.adminCard}>
              <View style={styles.adminInfo}>
                <View style={styles.adminHeader}>
                  {getRoleIcon(user.role)}
                  <Text style={[styles.adminRole, { color: getRoleColor(user.role) }]}>
                    {user.role.replace('_', ' ').toUpperCase()}
                  </Text>
                  {!user.is_active && (
                    <View style={styles.inactiveBadge}>
                      <Text style={styles.inactiveText}>INACTIVE</Text>
                    </View>
                  )}
                </View>
                
                <Text style={styles.adminName}>{user.full_name}</Text>
                <Text style={styles.adminEmail}>{user.email}</Text>
                
                <View style={styles.adminDetails}>
                  <Text style={styles.adminDetail}>
                    Granted: {formatDate(user.granted_at)}
                  </Text>
                  {user.granted_by_email && (
                    <Text style={styles.adminDetail}>
                      By: {user.granted_by_email}
                    </Text>
                  )}
                </View>
              </View>
              
              {user.role !== 'super_admin' && (
                <TouchableOpacity
                  style={styles.revokeButton}
                  onPress={() => revokeAdminRole(user.email, user.role)}
                >
                  <UserMinus size={16} color={Colors.error} />
                  <Text style={styles.revokeButtonText}>Revoke</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  header: {
    padding: 20,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  roleSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  roleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    gap: 8,
  },
  roleButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  roleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  roleButtonTextActive: {
    color: Colors.white,
  },
  grantForm: {
    gap: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  grantButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  grantButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  adminCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  adminInfo: {
    flex: 1,
  },
  adminHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  adminRole: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  inactiveBadge: {
    backgroundColor: Colors.error + '20',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  inactiveText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.error,
  },
  adminName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  adminEmail: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  adminDetails: {
    gap: 2,
  },
  adminDetail: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  revokeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: Colors.error + '10',
    gap: 6,
  },
  revokeButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.error,
  },
});
