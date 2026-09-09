import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { ScreenContainer } from '../components/ScreenContainer';
import { contentApi, progressApi } from '../api/client';
import YoutubeIframe from 'react-native-youtube-iframe';
import { theme } from '../theme/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Content'>;

export const ContentScreen: React.FC<Props> = ({ route, navigation }) => {
  const { topicId, topicTitle } = route.params;
  const [content, setContent] = useState<any>(null);
  const [mode, setMode] = useState<string>('dense');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  const fetchContent = async (selectedMode?: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await contentApi.getTopicContent(topicId, selectedMode);
      setContent(data);
    } catch (e: any) {
      if (e.response?.status === 403) {
        setError(
          e.response?.data?.detail ||
            'Topic dropped under High Urgency mode. Focus on topics with higher importance!'
        );
      } else {
        setError(e.response?.data?.detail || 'Failed to load study content');
      }
      setContent(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent(mode);
  }, [topicId, mode]);

  const handleComplete = async () => {
    try {
      await progressApi.completeTopic(topicId, mode);
      setCompleted(true);
    } catch (e) {
      console.error(e);
      setCompleted(true);
    }
  };

  const extractVideoId = (url?: string) => {
    if (!url) return null;
    const match = url.match(/[?&]v=([^&]+)/);
    return match ? match[1] : null;
  };

  const currentMode = content?.mode || mode;
  const youtubeId = extractVideoId(content?.videoUrl);

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Mode Selector Tabs */}
        <View style={styles.modeTabs}>
          {[
            { id: 'dense', label: '📖 Deep Focus' },
            { id: 'fast', label: '⚡ Fast Track' },
            { id: 'short_video', label: '🎬 Short Video' },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tabButton, mode === tab.id && styles.tabButtonActive]}
              onPress={() => setMode(tab.id)}
            >
              <Text
                style={[styles.tabButtonText, mode === tab.id && styles.tabButtonTextActive]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Fetching adaptive content...</Text>
          </View>
        ) : error ? (
          <View style={styles.droppedCard}>
            <Text style={styles.droppedIcon}>🚨</Text>
            <Text style={styles.droppedTitle}>Exam Filter Active</Text>
            <Text style={styles.droppedDesc}>{error}</Text>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>Return to Topics</Text>
            </TouchableOpacity>
          </View>
        ) : content ? (
          <View>
            {/* Header badges */}
            <View style={styles.badgeRow}>
              <View style={styles.modeBadge}>
                <Text style={styles.badgeText}>{currentMode.toUpperCase()}</Text>
              </View>
              {content.urgency_applied && (
                <View
                  style={[
                    styles.urgencyBadge,
                    {
                      backgroundColor:
                        content.urgency_applied === 'high'
                          ? theme.colors.urgency.high
                          : content.urgency_applied === 'medium'
                          ? theme.colors.urgency.medium
                          : theme.colors.urgency.low,
                    },
                  ]}
                >
                  <Text style={styles.badgeText}>
                    Urgency: {content.urgency_applied.toUpperCase()}
                  </Text>
                </View>
              )}
              {content.must_ask && (
                <View style={[styles.urgencyBadge, { backgroundColor: '#DC2626' }]}>
                  <Text style={styles.badgeText}>🔥 MUST ASK</Text>
                </View>
              )}
            </View>

            {/* Video Player if YouTube URL exists */}
            {youtubeId && (
              <View style={styles.videoCard}>
                <YoutubeIframe height={220} videoId={youtubeId} />
              </View>
            )}

            {/* Dense Mode View */}
            {currentMode === 'dense' && (
              <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Conceptual Notes</Text>
                <Text style={styles.bodyText}>{content.notes}</Text>

                {content.prerequisites && content.prerequisites.length > 0 && (
                  <View style={styles.subSection}>
                    <Text style={styles.subTitle}>📌 Prerequisites</Text>
                    {content.prerequisites.map((p: string, idx: number) => (
                      <Text key={idx} style={styles.listItem}>
                        • {p}
                      </Text>
                    ))}
                  </View>
                )}

                {content.textbooks && content.textbooks.length > 0 && (
                  <View style={styles.subSection}>
                    <Text style={styles.subTitle}>📚 Recommended References</Text>
                    {content.textbooks.map((b: any, idx: number) => (
                      <Text key={idx} style={styles.listItem}>
                        • {b.title} ({b.author})
                      </Text>
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* Fast Mode View */}
            {currentMode === 'fast' && (
              <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>⚡ Key Exam Takeaways</Text>
                {content.bullets &&
                  content.bullets.map((bullet: string, idx: number) => (
                    <View key={idx} style={styles.bulletItem}>
                      <Text style={styles.bulletDot}>✔</Text>
                      <Text style={styles.bulletText}>{bullet}</Text>
                    </View>
                  ))}

                {content.mustAskTopics && content.mustAskTopics.length > 0 && (
                  <View style={styles.mustAskBox}>
                    <Text style={styles.mustAskTitle}>🎯 High-Probability Exam Questions</Text>
                    {content.mustAskTopics.map((item: string, idx: number) => (
                      <Text key={idx} style={styles.mustAskItem}>
                        • {item}
                      </Text>
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* Short Video View */}
            {currentMode === 'short_video' && (
              <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>🎬 60-Second Micro-Learn</Text>
                {content.videos &&
                  content.videos.map((v: any, idx: number) => (
                    <View key={idx} style={styles.shortVideoCard}>
                      <Text style={styles.videoCaption}>{v.caption}</Text>
                      <Text style={styles.videoMeta}>
                        ⏱ Est. {content.est_minutes || 1} min review
                      </Text>
                      <Text style={styles.videoLinkText}>Source clip: {v.url}</Text>
                    </View>
                  ))}
              </View>
            )}

            {/* Complete Topic CTA */}
            <TouchableOpacity
              style={[styles.completeButton, completed && styles.completedButton]}
              onPress={handleComplete}
              disabled={completed}
            >
              <Text style={styles.completeButtonText}>
                {completed ? '✔ Topic Marked Complete!' : 'Mark Topic as Mastered'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
  },
  modeTabs: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: 4,
    marginBottom: theme.spacing.md,
  },
  tabButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
    borderRadius: theme.borderRadius.sm,
  },
  tabButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  tabButtonText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.caption.fontSize,
    fontWeight: '600',
  },
  tabButtonTextActive: {
    color: '#ffffff',
  },
  centerBox: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  loadingText: {
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
    fontSize: theme.typography.body2.fontSize,
  },
  droppedCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: theme.colors.urgency.high,
    borderWidth: 1,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    alignItems: 'center',
    marginTop: theme.spacing.lg,
  },
  droppedIcon: {
    fontSize: 48,
    marginBottom: theme.spacing.sm,
  },
  droppedTitle: {
    color: theme.colors.urgency.high,
    fontSize: theme.typography.h2.fontSize,
    fontWeight: 'bold',
    marginBottom: theme.spacing.sm,
  },
  droppedDesc: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: theme.spacing.lg,
  },
  backButton: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  backButtonText: {
    color: theme.colors.text,
    fontWeight: 'bold',
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  modeBadge: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  urgencyBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: theme.typography.caption.fontSize,
    fontWeight: 'bold',
  },
  videoCard: {
    backgroundColor: '#000',
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    marginBottom: theme.spacing.md,
  },
  sectionCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.h3.fontSize,
    fontWeight: 'bold',
    marginBottom: theme.spacing.md,
  },
  bodyText: {
    color: theme.colors.text,
    fontSize: theme.typography.body1.fontSize,
    lineHeight: 24,
  },
  subSection: {
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  subTitle: {
    color: theme.colors.primary,
    fontWeight: 'bold',
    fontSize: theme.typography.body2.fontSize,
    marginBottom: theme.spacing.xs,
  },
  listItem: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body2.fontSize,
    lineHeight: 20,
    marginTop: 2,
  },
  bulletItem: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  bulletDot: {
    color: theme.colors.success,
    fontWeight: 'bold',
  },
  bulletText: {
    color: theme.colors.text,
    fontSize: theme.typography.body1.fontSize,
    flex: 1,
    lineHeight: 22,
  },
  mustAskBox: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderColor: theme.colors.urgency.medium,
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  mustAskTitle: {
    color: theme.colors.urgency.medium,
    fontWeight: 'bold',
    fontSize: theme.typography.body2.fontSize,
    marginBottom: theme.spacing.xs,
  },
  mustAskItem: {
    color: theme.colors.text,
    fontSize: theme.typography.body2.fontSize,
    lineHeight: 20,
    marginTop: 2,
  },
  shortVideoCard: {
    backgroundColor: '#0F172A',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  videoCaption: {
    color: theme.colors.text,
    fontSize: theme.typography.body1.fontSize,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  videoMeta: {
    color: theme.colors.primary,
    fontSize: theme.typography.caption.fontSize,
  },
  videoLinkText: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    marginTop: theme.spacing.xs,
  },
  completeButton: {
    backgroundColor: theme.colors.success,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  completedButton: {
    backgroundColor: '#334155',
  },
  completeButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: theme.typography.body1.fontSize,
  },
});
