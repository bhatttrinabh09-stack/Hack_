import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import Swiper from 'react-native-deck-swiper';
import { catalogApi, cardsApi, swipeApi } from '../api/client';
import { theme } from '../theme/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Swipe'>;

export const SwipeScreen: React.FC<Props> = ({ navigation, route }) => {
  const { subjectId, topicId, topicTitle } = route.params;
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const swiperRef = useRef<Swiper<any>>(null);

  const [progress, setProgress] = useState(new Animated.Value(0));
  const swipeStartTime = useRef(Date.now());

  useEffect(() => {
    const fetchCardsData = async () => {
      setLoading(true);
      try {
        if (topicId) {
          const cardData = await cardsApi.getSwipeCards(topicId);
          if (cardData && cardData.length > 0) {
            setCards(cardData);
            setLoading(false);
            return;
          }
        }

        // Fallback or full subject mode
        const targetSubId = subjectId || 'os-sem3-aiml';
        const topicData = await catalogApi.getTopics(targetSubId);
        const mapped = topicData.map((t: any) => ({
          id: t.id,
          topicId: t.id,
          type: 'topic',
          title: t.title,
          preview: `Module #${t.order} in Operating Systems. Tap LEARN to dive into adaptive notes & videos.`,
          isMustAsk: t.order <= 5,
        }));
        setCards(mapped);
      } catch (e) {
        console.error('Error fetching cards:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchCardsData();
  }, [topicId, subjectId]);

  useEffect(() => {
    if (!loading && cards.length > 0) {
      startTimer();
    }
    return () => {
      progress.stopAnimation();
    };
  }, [loading, cards]);

  const startTimer = () => {
    progress.setValue(0);
    swipeStartTime.current = Date.now();
    Animated.timing(progress, {
      toValue: 1,
      duration: 6000,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) {
        swiperRef.current?.swipeLeft();
      }
    });
  };

  const handleSwipe = async (cardIndex: number, direction: 'right' | 'left') => {
    progress.stopAnimation();
    const card = cards[cardIndex];
    if (!card) return;

    const tId = card.topicId || topicId || card.id;
    try {
      await swipeApi.recordSwipe(tId, direction, card.id, card.type);
    } catch (e) {
      console.warn('Swipe telemetry recording failed:', e);
    }

    if (direction === 'right') {
      navigation.navigate('Content', { topicId: tId, topicTitle: card.title });
    } else {
      startTimer();
    }
  };

  const renderCard = (card: any) => {
    if (!card) return <View style={styles.card} />;
    return (
      <View style={styles.card}>
        <View style={styles.cardHeaderBadge}>
          <Text style={styles.cardTypeBadge}>
            {(card.type || 'CARD').toUpperCase()}
          </Text>
          {card.isMustAsk && (
            <Text style={styles.mustAskBadge}>★ HIGH EXAM FREQUENCY</Text>
          )}
        </View>

        <Text style={styles.cardTitle}>{card.title}</Text>
        <Text style={styles.cardDesc}>{card.preview}</Text>

        <View style={styles.cardFooter}>
          <Text style={styles.cardFooterHint}>
            👈 Swipe Left to Skip  |  Swipe Right to Learn 👉
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading Cards...</Text>
      </View>
    );
  }

  if (cards.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>No cards found for this selection.</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 5-second Auto-advance countdown bar */}
      <View style={styles.progressBarContainer}>
        <Animated.View
          style={[
            styles.progressBar,
            {
              width: progress.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>

      {/* Card Deck Swiper */}
      <View style={styles.swiperContainer}>
        <Swiper
          ref={swiperRef}
          cards={cards}
          renderCard={renderCard}
          onSwipedLeft={(index) => handleSwipe(index, 'left')}
          onSwipedRight={(index) => handleSwipe(index, 'right')}
          backgroundColor="transparent"
          stackSize={3}
          cardIndex={0}
          disableTopSwipe
          disableBottomSwipe
          overlayLabels={{
            left: {
              title: 'SKIP',
              style: {
                label: {
                  color: theme.colors.error,
                  borderColor: theme.colors.error,
                  borderWidth: 3,
                },
                wrapper: {
                  alignItems: 'flex-end',
                  justifyContent: 'flex-start',
                  marginTop: 20,
                  marginLeft: -20,
                },
              },
            },
            right: {
              title: 'LEARN',
              style: {
                label: {
                  color: theme.colors.success,
                  borderColor: theme.colors.success,
                  borderWidth: 3,
                },
                wrapper: {
                  alignItems: 'flex-start',
                  justifyContent: 'flex-start',
                  marginTop: 20,
                  marginLeft: 20,
                },
              },
            },
          }}
          onSwipedAll={() => navigation.goBack()}
        />
      </View>

      {/* Manual Clickable Controls for Web & Touch Accessibility */}
      <View style={styles.bottomControls}>
        <TouchableOpacity
          style={styles.skipBtn}
          onPress={() => swiperRef.current?.swipeLeft()}
        >
          <Text style={styles.skipBtnText}>✕ Skip</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.learnBtn}
          onPress={() => swiperRef.current?.swipeRight()}
        >
          <Text style={styles.learnBtnText}>♥ Learn</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: theme.spacing.xl,
  },
  loadingText: {
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
  },
  emptyText: {
    color: theme.colors.text,
    fontSize: theme.typography.h3.fontSize,
    marginBottom: theme.spacing.md,
  },
  backBtn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  backBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  progressBarContainer: {
    height: 5,
    backgroundColor: theme.colors.surface,
    width: '100%',
  },
  progressBar: {
    height: '100%',
    backgroundColor: theme.colors.primary,
  },
  swiperContainer: {
    flex: 1,
  },
  card: {
    height: 440,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 2,
    borderColor: '#334155',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.xl,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  cardHeaderBadge: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTypeBadge: {
    backgroundColor: theme.colors.primary,
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 3,
    borderRadius: 4,
  },
  mustAskBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderColor: theme.colors.urgency.high,
    borderWidth: 1,
    color: theme.colors.urgency.high,
    fontSize: 11,
    fontWeight: 'bold',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
    marginVertical: theme.spacing.md,
  },
  cardDesc: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: theme.spacing.md,
    alignItems: 'center',
  },
  cardFooterHint: {
    color: theme.colors.textSecondary,
    fontSize: 12,
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
  },
  skipBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: theme.colors.error,
    borderWidth: 2,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.full,
    minWidth: 130,
    alignItems: 'center',
  },
  skipBtnText: {
    color: theme.colors.error,
    fontSize: theme.typography.body1.fontSize,
    fontWeight: 'bold',
  },
  learnBtn: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: theme.colors.success,
    borderWidth: 2,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.full,
    minWidth: 130,
    alignItems: 'center',
  },
  learnBtnText: {
    color: theme.colors.success,
    fontSize: theme.typography.body1.fontSize,
    fontWeight: 'bold',
  },
});
