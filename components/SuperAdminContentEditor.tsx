import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Search, 
  Edit3, 
  Save, 
  X, 
  History, 
  RotateCcw, 
  Filter,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Eye,
  Copy,
  RefreshCw,
  Settings,
  BookOpen,
  Users,
  Target,
  Dumbbell,
  MessageCircle,
  Zap,
  Star,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp
} from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import { 
  contentService, 
  AppContentText, 
  ContentHistory 
} from '@/lib/contentService';
import Colors from '@/constants/colors';
import ContentPreviewCard from './ContentPreviewCard';
import AdvancedFiltersModal from './AdvancedFiltersModal';

const { width } = Dimensions.get('window');

interface ContentEditorProps {
  visible: boolean;
  onClose: () => void;
}

// Section icons mapping
const SECTION_ICONS = {
  dashboard: BookOpen,
  application: Target,
  fitness: Dumbbell,
  community: Users,
  ui: Zap,
  modal: MessageCircle,
  tooltip: AlertCircle,
};

export default function SuperAdminContentEditor({ visible, onClose }: ContentEditorProps) {
  const { user, isSuperAdmin } = useAuth();
  const [content, setContent] = useState<Map<string, AppContentText[]>>(new Map());
  const [filteredContent, setFilteredContent] = useState<AppContentText[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [editingContent, setEditingContent] = useState<AppContentText | null>(null);
  const [editText, setEditText] = useState('');
  const [saving, setSaving] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [contentHistory, setContentHistory] = useState<ContentHistory[]>([]);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newContent, setNewContent] = useState({
    key: '',
    section: '',
    component: '',
    text: '',
    description: ''
  });
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [bulkMode, setBulkMode] = useState(false);
  const [stats, setStats] = useState({
    totalItems: 0,
    recentlyUpdated: 0,
    sections: 0,
  });
  const [searchFilters, setSearchFilters] = useState({
    textOnly: false,
    keyOnly: false,
    descriptionOnly: false,
    recentlyUpdated: false,
    hasHistory: false,
    emptyContent: false,
  });
  const [sortBy, setSortBy] = useState<'key' | 'section' | 'updated' | 'created'>('updated');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Check super admin access
  useEffect(() => {
    if (visible && !isSuperAdmin()) {
      Alert.alert('Access Denied', 'Only super admins can access this feature.');
      onClose();
    }
  }, [visible, isSuperAdmin, onClose]);

  // Load content
  const loadContent = useCallback(async () => {
    try {
      setLoading(true);
      const allContent = await contentService.getAllContent();
      setContent(allContent);
      setFilteredContent(Array.from(allContent.values()).flat());
      
      // Calculate stats
      const totalItems = Array.from(allContent.values()).flat().length;
      const sections = allContent.size;
      const recentlyUpdated = Array.from(allContent.values())
        .flat()
        .filter(item => {
          const lastUpdate = new Date(item.last_updated_at);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return lastUpdate > weekAgo;
        }).length;
      
      setStats({ totalItems, sections, recentlyUpdated });
    } catch (error) {
      console.error('Error loading content:', error);
      Alert.alert('Error', 'Failed to load content. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (visible) {
      loadContent();
    }
  }, [visible, loadContent]);

  // Filter content based on search, section, and advanced filters
  useEffect(() => {
    let filtered = Array.from(content.values()).flat();
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => {
        if (searchFilters.textOnly) {
          return item.current_text.toLowerCase().includes(query);
        }
        if (searchFilters.keyOnly) {
          return item.content_key.toLowerCase().includes(query);
        }
        if (searchFilters.descriptionOnly) {
          return item.description && item.description.toLowerCase().includes(query);
        }
        return item.content_key.toLowerCase().includes(query) ||
               item.current_text.toLowerCase().includes(query) ||
               (item.description && item.description.toLowerCase().includes(query));
      });
    }
    
    // Filter by section
    if (selectedSection !== 'all') {
      filtered = filtered.filter(item => item.section === selectedSection);
    }
    
    // Advanced filters
    if (searchFilters.recentlyUpdated) {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      filtered = filtered.filter(item => 
        new Date(item.last_updated_at) > oneWeekAgo
      );
    }
    
    if (searchFilters.hasHistory) {
      filtered = filtered.filter(item => 
        new Date(item.last_updated_at) > new Date(item.created_at)
      );
    }
    
    if (searchFilters.emptyContent) {
      filtered = filtered.filter(item => 
        !item.current_text.trim() || item.current_text.trim().length < 10
      );
    }
    
    // Sort content
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'key':
          aValue = a.content_key;
          bValue = b.content_key;
          break;
        case 'section':
          aValue = a.section;
          bValue = b.section;
          break;
        case 'updated':
          aValue = new Date(a.last_updated_at);
          bValue = new Date(b.last_updated_at);
          break;
        case 'created':
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
        default:
          aValue = new Date(a.last_updated_at);
          bValue = new Date(b.last_updated_at);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    setFilteredContent(filtered);
  }, [content, searchQuery, selectedSection, searchFilters, sortBy, sortOrder]);

  // Get unique sections
  const sections = Array.from(content.keys()).sort();

  // Toggle section expansion
  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  // Start editing content
  const startEditing = (contentItem: AppContentText) => {
    setEditingContent(contentItem);
    setEditText(contentItem.current_text);
  };

  // Save content changes
  const saveContent = async () => {
    if (!editingContent || !user?.id) return;

    try {
      setSaving(true);
      const result = await contentService.updateContent(
        editingContent.content_key,
        editText,
        user.id,
        'Content updated via admin panel'
      );

      if (result.success) {
        Alert.alert('Success', 'Content updated successfully!');
        setEditingContent(null);
        setEditText('');
        await loadContent(); // Refresh content
      } else {
        Alert.alert('Error', result.error || 'Failed to update content');
      }
    } catch (error) {
      console.error('Error saving content:', error);
      Alert.alert('Error', 'Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // View content history
  const viewHistory = async (contentItem: AppContentText) => {
    try {
      const history = await contentService.getContentHistory(contentItem.id);
      setContentHistory(history);
      setShowHistory(true);
    } catch (error) {
      console.error('Error loading history:', error);
      Alert.alert('Error', 'Failed to load content history.');
    }
  };

  // Revert to previous version
  const revertContent = async (historyItem: ContentHistory) => {
    if (!editingContent || !user?.id) return;

    Alert.alert(
      'Revert Content',
      'Are you sure you want to revert to this previous version?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Revert',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await contentService.revertContent(
                editingContent.id,
                historyItem.id,
                user.id
              );

              if (result.success) {
                Alert.alert('Success', 'Content reverted successfully!');
                setShowHistory(false);
                setEditingContent(null);
                await loadContent(); // Refresh content
              } else {
                Alert.alert('Error', result.error || 'Failed to revert content');
              }
            } catch (error) {
              console.error('Error reverting content:', error);
              Alert.alert('Error', 'Failed to revert content.');
            }
          }
        }
      ]
    );
  };

  // Create new content
  const createContent = async () => {
    if (!user?.id || !newContent.key || !newContent.section || !newContent.component || !newContent.text) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    try {
      setSaving(true);
      const result = await contentService.createContent(
        newContent.key,
        newContent.section,
        newContent.component,
        newContent.text,
        newContent.description,
        user.id
      );

      if (result.success) {
        Alert.alert('Success', 'Content created successfully!');
        setShowCreateModal(false);
        setNewContent({ key: '', section: '', component: '', text: '', description: '' });
        await loadContent(); // Refresh content
      } else {
        Alert.alert('Error', result.error || 'Failed to create content');
      }
    } catch (error) {
      console.error('Error creating content:', error);
      Alert.alert('Error', 'Failed to create content.');
    } finally {
      setSaving(false);
    }
  };

  // Delete content
  const deleteContent = (contentItem: AppContentText) => {
    Alert.alert(
      'Delete Content',
      `Are you sure you want to delete "${contentItem.content_key}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await contentService.deleteContent(contentItem.content_key);
              if (result.success) {
                Alert.alert('Success', 'Content deleted successfully!');
                await loadContent(); // Refresh content
              } else {
                Alert.alert('Error', result.error || 'Failed to delete content');
              }
            } catch (error) {
              console.error('Error deleting content:', error);
              Alert.alert('Error', 'Failed to delete content.');
            }
          }
        }
      ]
    );
  };

  // Bulk operations
  const toggleItemSelection = (contentKey: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(contentKey)) {
      newSelected.delete(contentKey);
    } else {
      newSelected.add(contentKey);
    }
    setSelectedItems(newSelected);
  };

  const selectAll = () => {
    const allKeys = filteredContent.map(item => item.content_key);
    setSelectedItems(new Set(allKeys));
  };

  const clearSelection = () => {
    setSelectedItems(new Set());
  };

  const bulkDelete = () => {
    if (selectedItems.size === 0) return;

    Alert.alert(
      'Bulk Delete',
      `Are you sure you want to delete ${selectedItems.size} items? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const promises = Array.from(selectedItems).map(key => 
                contentService.deleteContent(key)
              );
              const results = await Promise.all(promises);
              const successCount = results.filter(r => r.success).length;
              
              Alert.alert('Bulk Delete Complete', `Successfully deleted ${successCount} of ${selectedItems.size} items.`);
              clearSelection();
              setBulkMode(false);
              await loadContent();
            } catch (error) {
              Alert.alert('Error', 'Failed to perform bulk delete.');
            }
          }
        }
      ]
    );
  };

  const bulkExport = () => {
    if (selectedItems.size === 0) return;
    
    try {
      const selectedContent = Array.from(selectedItems).map(key => {
        const item = Array.from(content.values()).flat().find(c => c.content_key === key);
        return item;
      }).filter(Boolean);
      
      const exportData = {
        exportedAt: new Date().toISOString(),
        totalItems: selectedContent.length,
        content: selectedContent
      };
      
      // In a real app, you'd save this to a file or clipboard
      console.log('Export data:', JSON.stringify(exportData, null, 2));
      Alert.alert('Export Complete', `Exported ${selectedContent.length} items to console.`);
    } catch (error) {
      console.error('Error during bulk export:', error);
      Alert.alert('Error', 'Failed to export selected items.');
    }
  };

  const bulkDuplicate = () => {
    if (selectedItems.size === 0) return;
    
    Alert.alert(
      'Bulk Duplicate',
      `Are you sure you want to duplicate ${selectedItems.size} content items?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Duplicate',
          onPress: async () => {
            try {
              let successCount = 0;
              let errorCount = 0;
              
              for (const contentKey of selectedItems) {
                const originalItem = Array.from(content.values()).flat().find(c => c.content_key === contentKey);
                if (originalItem) {
                  const newKey = `${originalItem.content_key}_copy`;
                  const result = await contentService.createContent(
                    newKey,
                    originalItem.section,
                    originalItem.component,
                    originalItem.current_text,
                    originalItem.description,
                    user?.id
                  );
                  if (result.success) {
                    successCount++;
                  } else {
                    errorCount++;
                  }
                }
              }
              
              Alert.alert(
                'Bulk Duplicate Complete',
                `Successfully duplicated ${successCount} items. ${errorCount > 0 ? `${errorCount} items failed to duplicate.` : ''}`
              );
              
              setSelectedItems(new Set());
              await loadContent();
            } catch (error) {
              console.error('Error during bulk duplicate:', error);
              Alert.alert('Error', 'Failed to complete bulk duplicate operation.');
            }
          }
        }
      ]
    );
  };

  // Copy content key
  const copyContentKey = (contentKey: string) => {
    // In a real app, you'd use Clipboard API
    Alert.alert('Copied!', `Content key "${contentKey}" copied to clipboard.`);
  };

  // Render content item
  const renderContentItem = ({ item }: { item: AppContentText }) => {
    const isEditing = editingContent?.id === item.id;
    const isSelected = selectedItems.has(item.content_key);
    const IconComponent = SECTION_ICONS[item.section as keyof typeof SECTION_ICONS] || BookOpen;
    
    return (
      <View style={[
        styles.contentItem,
        isSelected && styles.selectedItem,
        bulkMode && styles.bulkModeItem
      ]}>
        {bulkMode && (
          <TouchableOpacity
            style={[styles.checkbox, isSelected && styles.checkboxSelected]}
            onPress={() => toggleItemSelection(item.content_key)}
          >
            {isSelected && <CheckCircle size={16} color={Colors.white} />}
          </TouchableOpacity>
        )}
        
        <View style={styles.contentHeader}>
          <View style={styles.contentKey}>
            <View style={styles.contentKeyRow}>
              <IconComponent size={16} color={Colors.primary} />
              <Text style={styles.contentKeyText}>{item.content_key}</Text>
            </View>
            <Text style={styles.contentComponent}>{item.component}</Text>
          </View>
          <View style={styles.contentActions}>
            {!bulkMode && (
              <>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => copyContentKey(item.content_key)}
                >
                  <Copy size={16} color={Colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => viewHistory(item)}
                >
                  <History size={16} color={Colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => startEditing(item)}
                >
                  <Edit3 size={16} color={Colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => deleteContent(item)}
                >
                  <Trash2 size={16} color={Colors.error} />
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
        
        {isEditing ? (
          <View style={styles.editContainer}>
            <ContentPreviewCard 
              content={editText}
              contentKey={item.content_key}
              isEditing={true}
            />
            <TextInput
              style={styles.editInput}
              value={editText}
              onChangeText={setEditText}
              multiline
              placeholder="Enter new text..."
            />
            <View style={styles.editActions}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  setEditingContent(null);
                  setEditText('');
                }}
              >
                <X size={16} color={Colors.white} />
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={saveContent}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size={16} color={Colors.white} />
                ) : (
                  <Save size={16} color={Colors.white} />
                )}
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.contentPreview}>
            <Text style={styles.contentText}>{item.current_text}</Text>
            {item.description && (
              <Text style={styles.contentDescription}>{item.description}</Text>
            )}
            <View style={styles.contentMeta}>
              <Clock size={12} color={Colors.textSecondary} />
              <Text style={styles.contentMetaText}>
                Updated: {new Date(item.last_updated_at).toLocaleDateString()}
              </Text>
            </View>
          </View>
        )}
      </View>
    );
  };

  // Render section
  const renderSection = (section: string) => {
    const sectionContent = content.get(section) || [];
    const isExpanded = expandedSections.has(section);
    const IconComponent = SECTION_ICONS[section as keyof typeof SECTION_ICONS] || BookOpen;
    
    return (
      <View key={section} style={styles.sectionContainer}>
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => toggleSection(section)}
        >
          <View style={styles.sectionInfo}>
            <IconComponent size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>{section}</Text>
            <View style={styles.sectionBadge}>
              <Text style={styles.sectionCount}>{sectionContent.length}</Text>
            </View>
          </View>
          {isExpanded ? (
            <ChevronUp size={20} color={Colors.textSecondary} />
          ) : (
            <ChevronDown size={20} color={Colors.textSecondary} />
          )}
        </TouchableOpacity>
        
        {isExpanded && (
          <View style={styles.sectionContent}>
            {sectionContent.map(item => (
              <View key={item.id}>
                {renderContentItem({ item })}
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.container}>
        {/* Enhanced Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Content Editor</Text>
            <Text style={styles.headerSubtitle}>Manage all app text content</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => setBulkMode(!bulkMode)}
            >
              <Settings size={20} color={Colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.totalItems}</Text>
            <Text style={styles.statLabel}>Total Items</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.sections}</Text>
            <Text style={styles.statLabel}>Sections</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.recentlyUpdated}</Text>
            <Text style={styles.statLabel}>Recent Updates</Text>
          </View>
        </View>

        {/* Enhanced Search and Filter */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Search size={20} color={Colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search content by key, text, or description..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={() => setShowSearchSuggestions(true)}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                style={styles.clearSearchButton}
                onPress={() => setSearchQuery('')}
              >
                <X size={16} color={Colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
          
          <View style={styles.filterContainer}>
            <View style={styles.filterHeader}>
              <Filter size={20} color={Colors.textSecondary} />
              <TouchableOpacity
                style={styles.advancedFiltersButton}
                onPress={() => setShowAdvancedFilters(true)}
              >
                <Text style={styles.advancedFiltersText}>Advanced</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  selectedSection === 'all' && styles.filterChipActive
                ]}
                onPress={() => setSelectedSection('all')}
              >
                <Text style={[
                  styles.filterChipText,
                  selectedSection === 'all' && styles.filterChipTextActive
                ]}>
                  All ({stats.totalItems})
                </Text>
              </TouchableOpacity>
              {sections.map(section => {
                const sectionContent = content.get(section) || [];
                return (
                  <TouchableOpacity
                    key={section}
                    style={[
                      styles.filterChip,
                      selectedSection === section && styles.filterChipActive
                    ]}
                    onPress={() => setSelectedSection(section)}
                  >
                    <Text style={[
                      styles.filterChipText,
                      selectedSection === section && styles.filterChipTextActive
                    ]}>
                      {section} ({sectionContent.length})
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>

        {/* Bulk Operations Bar */}
        {bulkMode && (
          <View style={styles.bulkOperationsBar}>
            <View style={styles.bulkInfo}>
              <Text style={styles.bulkText}>
                {selectedItems.size} items selected
              </Text>
            </View>
            <View style={styles.bulkActions}>
              <TouchableOpacity
                style={styles.bulkButton}
                onPress={selectAll}
              >
                <Text style={styles.bulkButtonText}>Select All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.bulkButton}
                onPress={clearSelection}
              >
                <Text style={styles.bulkButtonText}>Clear</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.bulkButton}
                onPress={bulkExport}
                disabled={selectedItems.size === 0}
              >
                <Copy size={16} color={Colors.primary} />
                <Text style={styles.bulkButtonText}>Export</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.bulkButton}
                onPress={bulkDuplicate}
                disabled={selectedItems.size === 0}
              >
                <Plus size={16} color={Colors.primary} />
                <Text style={styles.bulkButtonText}>Duplicate</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.bulkButton, styles.bulkDeleteButton]}
                onPress={bulkDelete}
                disabled={selectedItems.size === 0}
              >
                <Trash2 size={16} color={Colors.white} />
                <Text style={styles.bulkButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => setShowCreateModal(true)}
          >
            <Plus size={20} color={Colors.white} />
            <Text style={styles.createButtonText}>Create New Content</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={loadContent}
            disabled={loading}
          >
            <RefreshCw size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Content List */}
        <ScrollView style={styles.contentList} showsVerticalScrollIndicator={false}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loadingText}>Loading content...</Text>
            </View>
          ) : filteredContent.length === 0 ? (
            <View style={styles.emptyContainer}>
              <BookOpen size={48} color={Colors.textSecondary} />
              <Text style={styles.emptyText}>No content found</Text>
              <Text style={styles.emptySubtext}>
                {searchQuery ? 'Try adjusting your search terms' : 'Create new content to get started'}
              </Text>
            </View>
          ) : (
            <View>
              {sections.map(section => renderSection(section))}
            </View>
          )}
        </ScrollView>

        {/* Advanced Filters Modal */}
        <AdvancedFiltersModal
          visible={showAdvancedFilters}
          onClose={() => setShowAdvancedFilters(false)}
          filters={searchFilters}
          onFiltersChange={setSearchFilters}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={(newSortBy, newSortOrder) => {
            setSortBy(newSortBy);
            setSortOrder(newSortOrder);
          }}
        />

        {/* Enhanced Create Content Modal */}
        <Modal
          visible={showCreateModal}
          animationType="slide"
          presentationStyle="formSheet"
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <Plus size={24} color={Colors.primary} />
                <Text style={styles.modalTitle}>Create New Content</Text>
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowCreateModal(false)}
              >
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Content Key *</Text>
                <TextInput
                  style={styles.input}
                  value={newContent.key}
                  onChangeText={(text) => setNewContent(prev => ({ ...prev, key: text }))}
                  placeholder="e.g., dashboard.hero.greeting"
                />
                <Text style={styles.inputHint}>
                  Use dot notation: section.component.element
                </Text>
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Section *</Text>
                <View style={styles.sectionPicker}>
                  {sections.map(section => (
                    <TouchableOpacity
                      key={section}
                      style={[
                        styles.sectionOption,
                        newContent.section === section && styles.sectionOptionSelected
                      ]}
                      onPress={() => setNewContent(prev => ({ ...prev, section }))}
                    >
                      <Text style={[
                        styles.sectionOptionText,
                        newContent.section === section && styles.sectionOptionTextSelected
                      ]}>
                        {section}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Component *</Text>
                <TextInput
                  style={styles.input}
                  value={newContent.component}
                  onChangeText={(text) => setNewContent(prev => ({ ...prev, component: text }))}
                  placeholder="e.g., hero, button, modal"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Text Content *</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={newContent.text}
                  onChangeText={(text) => setNewContent(prev => ({ ...prev, text }))}
                  placeholder="Enter the text content..."
                  multiline
                  numberOfLines={4}
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={newContent.description}
                  onChangeText={(text) => setNewContent(prev => ({ ...prev, description: text }))}
                  placeholder="Optional description for this content..."
                  multiline
                  numberOfLines={3}
                />
              </View>
            </ScrollView>
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={createContent}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size={16} color={Colors.white} />
                ) : (
                  <Text style={styles.buttonText}>Create</Text>
                )}
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Modal>

        {/* Enhanced History Modal */}
        <Modal
          visible={showHistory}
          animationType="slide"
          presentationStyle="formSheet"
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <History size={24} color={Colors.primary} />
                <Text style={styles.modalTitle}>Content History</Text>
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowHistory(false)}
              >
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent}>
              {contentHistory.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <History size={48} color={Colors.textSecondary} />
                  <Text style={styles.emptyText}>No history available</Text>
                </View>
              ) : (
                contentHistory.map((historyItem, index) => (
                  <View key={historyItem.id} style={styles.historyItem}>
                    <View style={styles.historyHeader}>
                      <Text style={styles.historyVersion}>Version {contentHistory.length - index}</Text>
                      <Text style={styles.historyDate}>
                        {new Date(historyItem.changed_at).toLocaleString()}
                      </Text>
                    </View>
                    <Text style={styles.historyText}>{historyItem.previous_text}</Text>
                    <TouchableOpacity
                      style={[styles.button, styles.revertButton]}
                      onPress={() => revertContent(historyItem)}
                    >
                      <RotateCcw size={16} color={Colors.white} />
                      <Text style={styles.buttonText}>Revert to This Version</Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </ScrollView>
          </SafeAreaView>
        </Modal>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  headerLeft: {
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerButton: {
    padding: 8,
  },
  closeButton: {
    padding: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  statCard: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  searchContainer: {
    padding: 16,
    gap: 12,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: Colors.text,
  },
  clearSearchButton: {
    padding: 8,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  advancedFiltersButton: {
    backgroundColor: Colors.primary + '10',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  advancedFiltersText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  filterChipTextActive: {
    color: Colors.white,
    fontWeight: '600',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  createButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  refreshButton: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  contentList: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  sectionContainer: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginBottom: 8,
  },
  sectionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    textTransform: 'capitalize',
  },
  sectionBadge: {
    backgroundColor: Colors.primary + '10',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  sectionCount: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
  sectionContent: {
    gap: 12,
    paddingLeft: 8,
  },
  contentItem: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 8,
  },
  selectedItem: {
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  bulkModeItem: {
    borderColor: Colors.primary + '10',
    borderWidth: 1,
    paddingLeft: 40,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
    marginRight: 12,
  },
  checkboxSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
       contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
     contentKey: {
    flex: 1,
    marginRight: 12,
  },
   contentKeyRow: {
     flexDirection: 'row',
     alignItems: 'center',
     marginBottom: 4,
   },
  contentKeyText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: 8,
    flex: 1,
  },
  contentComponent: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  contentActions: {
    flexDirection: 'row',
    gap: 8,
    flexShrink: 0,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.background,
  },
  deleteButton: {
    backgroundColor: Colors.error + '20',
  },
  contentPreview: {
    gap: 8,
    marginTop: 8,
  },
  contentText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
    marginBottom: 4,
  },
  contentDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  contentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  contentMetaText: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  editContainer: {
    gap: 12,
  },
  editInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: Colors.text,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  editActions: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
    flex: 1,
  },
  cancelButton: {
    backgroundColor: Colors.textSecondary,
  },
  saveButton: {
    backgroundColor: Colors.primary,
  },
  revertButton: {
    backgroundColor: Colors.warning,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: Colors.text,
    backgroundColor: Colors.white,
  },
  inputHint: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  sectionPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sectionOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionOptionSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  sectionOptionText: {
    fontSize: 14,
    color: Colors.text,
  },
  sectionOptionTextSelected: {
    color: Colors.white,
    fontWeight: '600',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  historyItem: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyVersion: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  historyDate: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  historyText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
    marginBottom: 12,
  },
  bulkOperationsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  bulkInfo: {
    flex: 1,
    alignItems: 'center',
  },
  bulkText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  bulkActions: {
    flexDirection: 'row',
    gap: 12,
  },
  bulkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: Colors.primary + '10',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  bulkButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  bulkDeleteButton: {
    backgroundColor: Colors.error,
    borderColor: Colors.error,
  },
});
