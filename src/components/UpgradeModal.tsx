import { useTranslation } from 'react-i18next';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS, RADIUS, SPACING } from '../theme';
import { Language } from '../i18n/translations';

interface UpgradeModalProps {
  visible: boolean;
  onClose: () => void;
  onPromoCodeSubmit: (code: string) => Promise<boolean>;
  onUpgradeClick: () => void;
  language: Language;
}

export default function UpgradeModal({
  visible,
  onClose,
  onPromoCodeSubmit,
  onUpgradeClick,
  language,
}: UpgradeModalProps) {
  const { t } = useTranslation();
  const [promoCode, setPromoCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [showPromo, setShowPromo] = useState(false);
  const insets = useSafeAreaInsets();

  const handlePromoSubmit = async () => {
    if (!promoCode.trim()) {
      Alert.alert(t('errorTitle'), t('promoEnterCode'));
      return;
    }

    setLoading(true);
    try {
      const success = await onPromoCodeSubmit(promoCode.trim());
      if (success) {
        setPromoCode('');
        onClose();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal 
      visible={visible} 
      animationType="fade" 
      transparent 
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.contentSheet}>
          <ScrollView
            contentContainerStyle={[
              styles.content,
              { paddingBottom: SPACING * 2 + insets.bottom },
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            automaticallyAdjustKeyboardInsets
          >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.emoji}>👑</Text>
            <Text style={styles.title}>{t('promoTitle')}</Text>
            <Pressable onPress={() => {
              onClose();
            }} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </Pressable>
          </View>

          {/* Benefits */}
          <View style={styles.benefits}>
            <BenefitRow icon="♾️" text={t('promoUnlimitedDaily')} />
            <BenefitRow icon="📸" text={t('promoPhotoVideoText')} />
            <BenefitRow icon="⚡" text={t('promoFastAnalysis')} />
            <BenefitRow icon="📊" text={t('promoDetailedGuides')} />
          </View>

          {/* Pricing */}
          <View style={styles.pricing}>
            <PricingCard
              duration={t('promoPricingMonthly')}
              price="CHF 7"
              selected={selectedPlan === 'monthly'}
              onPress={() => setSelectedPlan('monthly')}
            />
            <PricingCard
              duration={t('promoPricingYearly')}
              price="CHF 50"
              highlight
              selected={selectedPlan === 'yearly'}
              onPress={() => setSelectedPlan('yearly')}
            />
          </View>

          {/* Payment Button */}
          <Pressable style={styles.payBtn} onPress={onUpgradeClick}>
            <Text style={styles.payBtnText}>{t('promoBuyButton')}</Text>
          </Pressable>

          {/* OR Divider */}
          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={styles.orText}>VEYA</Text>
            <View style={styles.line} />
          </View>

          {/* Promo Code (yalnizca "Promo kodum var" butonuna basinca acilir) */}
          {!showPromo ? (
            <Pressable
              style={styles.promoToggleBtn}
              onPress={() => setShowPromo(true)}
            >
              <Text style={styles.promoToggleBtnText}>{t('promoHaveCode')}</Text>
            </Pressable>
          ) : (
            <View style={styles.promoSection}>
              <Text style={styles.promoLabel}>{t('promoCodeLabel')}</Text>
              <TextInput
                style={styles.promoInput}
                placeholder="ABC123XYZ9"
                placeholderTextColor={COLORS.text + '80'}
                value={promoCode}
                onChangeText={setPromoCode}
                editable={!loading}
                autoFocus
              />
              <Pressable
                style={[styles.promoBtn, loading && styles.promoDisabled]}
                onPress={handlePromoSubmit}
                disabled={loading}
              >
                <Text style={styles.promoBtnText}>
                  {loading ? t('promoCodeChecking') : t('promoCodeButton')}
                </Text>
              </Pressable>
            </View>
          )}

          {/* Footer */}
          <Text style={styles.footer}>
            {t('promoTerms')}
          </Text>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function BenefitRow({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.benefitRow}>
      <Text style={styles.benefitIcon}>{icon}</Text>
      <Text style={styles.benefitText}>{text}</Text>
    </View>
  );
}

function PricingCard({ duration, price, highlight, badgeText, selected, onPress }: {
  duration: string;
  price: string;
  highlight?: boolean;
  badgeText?: string;
  selected?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.card,
        highlight && styles.cardHighlight,
        selected && styles.cardSelected
      ]}
    >
      {highlight && <View style={styles.badge}><Text style={styles.badgeText}>{badgeText || 'BEST'}</Text></View>}
      <Text style={styles.cardDuration}>{duration}</Text>
      <Text style={styles.cardPrice}>{price}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  contentSheet: {
    width: '100%',
    maxHeight: '90%',
    backgroundColor: COLORS.background,
    borderTopLeftRadius: RADIUS * 2,
    borderTopRightRadius: RADIUS * 2,
    overflow: 'hidden',
  },
  content: {
    paddingHorizontal: SPACING,
    paddingVertical: SPACING * 2,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING * 2,
    position: 'relative',
  },
  emoji: {
    fontSize: 32,
    marginBottom: SPACING / 2,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  closeBtn: {
    position: 'absolute',
    right: 0,
    top: 0,
    padding: SPACING,
  },
  closeText: {
    fontSize: 24,
    color: COLORS.text,
  },
  benefits: {
    marginBottom: SPACING * 2,
    gap: SPACING,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING,
  },
  benefitIcon: {
    fontSize: 18,
  },
  benefitText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  pricing: {
    gap: SPACING,
    marginBottom: SPACING * 2,
  },
  card: {
    alignSelf: 'stretch',
    borderRadius: RADIUS,
    borderWidth: 2,
    borderColor: COLORS.border,
    padding: SPACING,
    alignItems: 'center',
  },
  cardHighlight: {
    borderColor: COLORS.primary + '60',
  },
  cardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '20',
  },
  badge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING / 2,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: SPACING / 2,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  cardDuration: {
    fontSize: 14,
    color: COLORS.text + '99',
    marginBottom: SPACING / 2,
  },
  cardPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING * 1.5,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  orText: {
    marginHorizontal: SPACING,
    color: COLORS.text + '80',
    fontSize: 12,
    fontWeight: 'bold',
  },
  promoSection: {
    marginBottom: SPACING * 1.5,
  },
  promoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING / 2,
  },
  promoInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS,
    paddingHorizontal: SPACING,
    paddingVertical: SPACING * 0.75,
    marginBottom: SPACING,
    fontSize: 14,
    color: COLORS.text,
  },
  promoBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING * 0.75,
    borderRadius: RADIUS,
    alignItems: 'center',
  },
  promoDisabled: {
    opacity: 0.6,
  },
  promoBtnText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  promoToggleBtn: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingVertical: SPACING * 0.75,
    borderRadius: RADIUS,
    alignItems: 'center',
    marginBottom: SPACING * 1.5,
  },
  promoToggleBtnText: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  payBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING,
    borderRadius: RADIUS,
    alignItems: 'center',
    marginBottom: SPACING,
  },
  payBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 15,
  },
  footer: {
    textAlign: 'center',
    fontSize: 12,
    color: COLORS.text + '80',
    lineHeight: 18,
  },
});
