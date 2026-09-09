import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { ScreenContainer } from '../components/ScreenContainer';
import { catalogApi } from '../api/client';
import { theme } from '../theme/theme';
import { Topic } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'TopicList'>;

export const TopicListScreen: React.FC<Props> = ({ navigation, route }) => {
  const { subjectId } = route.params;
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const data = await catalogApi.getTopics(subjectId);
        setTopics(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchTopics();
  }, [subjectId]);

  return (
    <ScreenContainer loading={loading}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.swipeButton}
          onPress={() =>
            navigation.navigate('Swipe', {
              topicId: topics[0]?.id || 'os-t01',
              topicTitle: topics[0]?.title || 'Operating Systems',
              subjectId,
            })
          }
        >
          <Text style={styles.swipeButtonText}>🃏 Start Full Swiping Deck</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={topics}
        contentContainerStyle={styles.list}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.topicCard}>
            <View style={styles.topicHeader}>
              <Text style={styles.topicIndex}>#{index + 1}</Text>
              <Text style={styles.topicTitle}>{item.title}</Text>
              {item.is_must_ask && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>Must Ask</Text>
                </View>
              )}
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.studyBtn}
                onPress={() =>
                  navigation.navigate('Content', {
                    topicId: item.id,
                    topicTitle: item.title,
                  })
                }
              >
                <Text style={styles.studyBtnText}>📖 Deep Study</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.swipeBtn}
                onPress={() =>
                  navigation.navigate('Swipe', {
                    topicId: item.id,
                    topicTitle: item.title,
                    subjectId,
                  })
                }
              >
                <Text style={styles.swipeBtnText}>🃏 Swipe Cards</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    padding: theme.spacing.md,
  },
  swipeButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
  },
  swipeButtonText: {
    color: theme.colors.text,
    fontSize: theme.typography.h3.fontSize,
    fontWeight: 'bold',
  },
  list: {
    padding: theme.spacing.md,
  },
  topicCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  topicHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  topicTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.body1.fontSize,
    fontWeight: 'bold',
    flex: 1,
  },
  badge: {
    backgroundColor: theme.colors.urgency.high,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
    marginLeft: theme.spacing.sm,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: theme.typography.caption.fontSize,
    fontWeight: 'bold',
  },
  topicIndex: {
    color: theme.colors.primary,
    fontWeight: 'bold',
    fontSize: theme.typography.body1.fontSize,
    marginRight: theme.spacing.sm,
  },
  actionRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  studyBtn: {
    flex: 1,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderColor: theme.colors.primary,
    borderWidth: 1,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
  },
  studyBtnText: {
    color: theme.colors.primary,
    fontWeight: '600',
    fontSize: theme.typography.body2.fontSize,
  },
  swipeBtn: {
    flex: 1,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: theme.colors.success,
    borderWidth: 1,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
  },
  swipeBtnText: {
    color: theme.colors.success,
    fontWeight: '600',
    fontSize: theme.typography.body2.fontSize,
  },
});
