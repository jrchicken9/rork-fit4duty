import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { 
  Search, 
  Filter, 
  Plus, 
  RefreshCw, 
  Settings, 
  Download, 
  Upload, 
  Eye,
  Edit3,
  Trash2,
  Copy,
  History
} from 'lucide-react-native';
import Colors from '@/constants/colors';

interface QuickActionsToolbarProps {
  onSearch: () => void;
  onFilter: () => void;
  onCreate: () => void;
  onRefresh: () => void;
  onSettings: () => void;
  onExport: () => void;
  onImport: () => void;
  onPreview: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onCopy: () => void;
  onHistory: () => void;
  selectedCount: number;
  totalCount: number;
  loading: boolean;
}

export default function QuickActionsToolbar({
  onSearch,
  onFilter,
  onCreate,
  onRefresh,
  onSettings,
  onExport,
  onImport,
  onPreview,
  onEdit,
  onDelete,
  onCopy,
  onHistory,
  selectedCount,
  totalCount,
  loading
}: QuickActionsToolbarProps) {
  const QuickAction = ({ 
    icon: Icon, 
    label, 
    onPress, 
    disabled = false, 
    variant = 'default' 
  }: {
    icon: any;
    label: string;
    onPress: () => void;
    disabled?: boolean;
    variant?: 'default' | 'primary' | 'danger';
  }) => (
    <TouchableOpacity
      style={[
        styles.quickAction,
        variant === 'primary' && styles.quickActionPrimary,
        variant === 'danger' && styles.quickActionDanger,
        disabled && styles.quickActionDisabled
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Icon size={16} color={
        disabled ? Colors.textSecondary :
        variant === 'primary' ? Colors.white :
        variant === 'danger' ? Colors.white :
        Colors.primary
      } />
      <Text style={[
        styles.quickActionLabel,
        variant === 'primary' && styles.quickActionLabelPrimary,
        variant === 'danger' && styles.quickActionLabelDanger,
        disabled && styles.quickActionLabelDisabled
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Status Bar */}
      <View style={styles.statusBar}>
        <Text style={styles.statusText}>
          {selectedCount > 0 ? `${selectedCount} of ${totalCount} selected` : `${totalCount} total items`}
        </Text>
        {loading && (
          <View style={styles.loadingIndicator}>
            <RefreshCw size={14} color={Colors.primary} />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        )}
      </View>

      {/* Quick Actions */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.actionsContainer}
        contentContainerStyle={styles.actionsContent}
      >
        <QuickAction icon={Search} label="Search" onPress={onSearch} />
        <QuickAction icon={Filter} label="Filter" onPress={onFilter} />
        <QuickAction icon={Plus} label="Create" onPress={onCreate} variant="primary" />
        <QuickAction icon={RefreshCw} label="Refresh" onPress={onRefresh} disabled={loading} />
        <QuickAction icon={Settings} label="Settings" onPress={onSettings} />
        <QuickAction icon={Download} label="Export" onPress={onExport} />
        <QuickAction icon={Upload} label="Import" onPress={onImport} />
        <QuickAction icon={Eye} label="Preview" onPress={onPreview} />
        <QuickAction icon={Edit3} label="Edit" onPress={onEdit} />
        <QuickAction icon={Copy} label="Copy" onPress={onCopy} />
        <QuickAction icon={History} label="History" onPress={onHistory} />
        <QuickAction icon={Trash2} label="Delete" onPress={onDelete} variant="danger" />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.background,
  },
  statusText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  loadingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  loadingText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
  },
  actionsContainer: {
    maxHeight: 60,
  },
  actionsContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  quickActionPrimary: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  quickActionDanger: {
    backgroundColor: Colors.error,
    borderColor: Colors.error,
  },
  quickActionDisabled: {
    opacity: 0.5,
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.primary,
  },
  quickActionLabelPrimary: {
    color: Colors.white,
  },
  quickActionLabelDanger: {
    color: Colors.white,
  },
  quickActionLabelDisabled: {
    color: Colors.textSecondary,
  },
});
