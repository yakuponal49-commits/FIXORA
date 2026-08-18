import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Image,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
  LayoutChangeEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import * as ImageManipulator from 'expo-image-manipulator';

import { COLORS, RADIUS, SPACING } from '../theme';

const HANDLE_SIZE = 28;
const MIN_CROP = 60;

interface CropRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface DisplayRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface Props {
  uri: string;
  onBack: () => void;
  onCropped: (uri: string) => void;
}

export default function CropScreen({ uri, onBack, onCropped }: Props) {
  const { t } = useTranslation();

  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });
  const [origSize, setOrigSize] = useState({ w: 0, h: 0 });
  const [displayRect, setDisplayRect] = useState<DisplayRect>({ left: 0, top: 0, width: 0, height: 0 });
  const [cropState, setCropState] = useState<CropRect>({ x: 0, y: 0, w: 0, h: 0 });
  const [rotation, setRotation] = useState(0);
  const [aspectLock, setAspectLock] = useState(false);

  const cropRef = useRef<CropRect>({ x: 0, y: 0, w: 0, h: 0 });
  const gestureStartRef = useRef<CropRect>({ x: 0, y: 0, w: 0, h: 0 });
  const initDoneRef = useRef(false);

  const onContainerLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setContainerSize({ w: width, h: height });
  }, []);

  useEffect(() => {
    if (containerSize.w > 0 && origSize.w > 0) {
      const scale = Math.min(containerSize.w / origSize.w, containerSize.h / origSize.h);
      const dispW = origSize.w * scale;
      const dispH = origSize.h * scale;
      const rect: DisplayRect = {
        left: (containerSize.w - dispW) / 2,
        top: (containerSize.h - dispH) / 2,
        width: dispW,
        height: dispH,
      };
      setDisplayRect(rect);

      if (!initDoneRef.current) {
        initDoneRef.current = true;
        const pad = 16;
        const crop: CropRect = {
          x: rect.left + pad,
          y: rect.top + pad,
          w: rect.width - pad * 2,
          h: rect.height - pad * 2,
        };
        cropRef.current = crop;
        setCropState(crop);
      }
    }
  }, [containerSize, origSize]);

  const makeResponder = useCallback(
    (corner: string) =>
      PanResponder.create({
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          gestureStartRef.current = { ...cropRef.current };
        },
        onPanResponderMove: (_, gesture) => {
          const s = gestureStartRef.current;
          let { x, y, w, h } = s;
          const { dx, dy } = gesture;

          if (corner === 'tl') {
            x += dx; y += dy; w -= dx; h -= dy;
          } else if (corner === 'tr') {
            y += dy; w += dx; h -= dy;
          } else if (corner === 'bl') {
            x += dx; w -= dx; h += dy;
          } else {
            w += dx; h += dy;
          }

          if (aspectLock) {
            const size = Math.min(w, h);
            if (corner === 'tl') { x = s.x + s.w - size; y = s.y + s.h - size; }
            else if (corner === 'tr') { y = s.y + s.h - size; }
            else if (corner === 'bl') { x = s.x + s.w - size; }
            w = size; h = size;
          }

          if (w < MIN_CROP || h < MIN_CROP) return;
          if (x < displayRect.left - 5 || y < displayRect.top - 5) return;
          if (x + w > displayRect.left + displayRect.width + 5) return;
          if (y + h > displayRect.top + displayRect.height + 5) return;

          const next = { x, y, w, h };
          cropRef.current = next;
          setCropState({ ...next });
        },
      }),
    [aspectLock, displayRect],
  );

  const tlPan = useRef(makeResponder('tl')).current;
  const trPan = useRef(makeResponder('tr')).current;
  const blPan = useRef(makeResponder('bl')).current;
  const brPan = useRef(makeResponder('br')).current;

  const resetCrop = useCallback(() => {
    if (containerSize.w === 0 || origSize.w === 0) return;
    const scale = Math.min(containerSize.w / origSize.w, containerSize.h / origSize.h);
    const dispW = origSize.w * scale;
    const dispH = origSize.h * scale;
    const rect: DisplayRect = {
      left: (containerSize.w - dispW) / 2,
      top: (containerSize.h - dispH) / 2,
      width: dispW,
      height: dispH,
    };
    setDisplayRect(rect);
    const pad = 16;
    const crop: CropRect = {
      x: rect.left + pad,
      y: rect.top + pad,
      w: rect.width - pad * 2,
      h: rect.height - pad * 2,
    };
    cropRef.current = crop;
    setCropState(crop);
    setRotation(0);
  }, [containerSize, origSize]);

  const toggleAspect = useCallback(() => {
    setAspectLock((prev) => {
      const next = !prev;
      if (next && cropRef.current.w > 0) {
        const { x, y, w, h } = cropRef.current;
        const size = Math.min(w, h);
        const crop: CropRect = {
          x: x + (w - size) / 2,
          y: y + (h - size) / 2,
          w: size,
          h: size,
        };
        cropRef.current = crop;
        setCropState({ ...crop });
      }
      return next;
    });
  }, []);

  const handleRotate = useCallback(() => {
    setRotation((r) => (r + 90) % 360);
  }, []);

  const handleContinue = useCallback(async () => {
    if (origSize.w === 0 || displayRect.width === 0) return;

    const displayScale = Math.min(
      containerSize.w / origSize.w,
      containerSize.h / origSize.h,
    );
    const crop = cropRef.current;

    const originX = Math.max(0, Math.round((crop.x - displayRect.left) / displayScale));
    const originY = Math.max(0, Math.round((crop.y - displayRect.top) / displayScale));
    let cropW = Math.round(crop.w / displayScale);
    let cropH = Math.round(crop.h / displayScale);

    cropW = Math.min(cropW, origSize.w - originX);
    cropH = Math.min(cropH, origSize.h - originY);

    if (cropW <= 0 || cropH <= 0) {
      onCropped(uri);
      return;
    }

    try {
      const actions: ImageManipulator.Action[] = [];
      if (rotation !== 0) {
        actions.push({ rotate: String(rotation) as any });
      }
      actions.push({
        crop: {
          originX,
          originY,
          width: cropW,
          height: cropH,
        },
      });

      const result = await ImageManipulator.manipulateAsync(uri, actions, {
        compress: 0.85,
        format: ImageManipulator.SaveFormat.JPEG,
      });
      onCropped(result.uri);
    } catch {
      onCropped(uri);
    }
  }, [origSize, displayRect, containerSize, rotation, uri, onCropped]);

  const showCrop = cropState.w > 0 && cropState.h > 0;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <Pressable onPress={onBack} hitSlop={10} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </Pressable>
        <Text style={styles.topTitle}>{t('cropTitle')}</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.imageArea} onLayout={onContainerLayout}>
        <Image
          source={{ uri }}
          style={styles.image}
          resizeMode="contain"
          onLoad={(e) => {
            const { width, height } = e.nativeEvent.source;
            if (width > 0 && height > 0) {
              setOrigSize({ w: width, h: height });
            }
          }}
        />

        {showCrop && (
          <>
            <View style={[styles.dim, { top: 0, left: 0, right: 0, height: cropState.y }]} pointerEvents="none" />
            <View style={[styles.dim, { top: cropState.y + cropState.h, left: 0, right: 0, bottom: 0 }]} pointerEvents="none" />
            <View style={[styles.dim, { top: cropState.y, left: 0, width: cropState.x, height: cropState.h }]} pointerEvents="none" />
            <View style={[styles.dim, { top: cropState.y, left: cropState.x + cropState.w, right: 0, height: cropState.h }]} pointerEvents="none" />

            <View style={[styles.border, { left: cropState.x, top: cropState.y, width: cropState.w, height: cropState.h }]} pointerEvents="none" />

            <View style={[styles.gridV, { left: cropState.x + cropState.w / 3, top: cropState.y, height: cropState.h }]} pointerEvents="none" />
            <View style={[styles.gridV, { left: cropState.x + (cropState.w * 2) / 3, top: cropState.y, height: cropState.h }]} pointerEvents="none" />
            <View style={[styles.gridH, { top: cropState.y + cropState.h / 3, left: cropState.x, width: cropState.w }]} pointerEvents="none" />
            <View style={[styles.gridH, { top: cropState.y + (cropState.h * 2) / 3, left: cropState.x, width: cropState.w }]} pointerEvents="none" />

            <View style={[styles.handle, { left: cropState.x - HANDLE_SIZE / 2, top: cropState.y - HANDLE_SIZE / 2 }]} {...tlPan.panHandlers}>
              <View style={styles.cornerTL} />
            </View>
            <View style={[styles.handle, { left: cropState.x + cropState.w - HANDLE_SIZE / 2, top: cropState.y - HANDLE_SIZE / 2 }]} {...trPan.panHandlers}>
              <View style={styles.cornerTR} />
            </View>
            <View style={[styles.handle, { left: cropState.x - HANDLE_SIZE / 2, top: cropState.y + cropState.h - HANDLE_SIZE / 2 }]} {...blPan.panHandlers}>
              <View style={styles.cornerBL} />
            </View>
            <View style={[styles.handle, { left: cropState.x + cropState.w - HANDLE_SIZE / 2, top: cropState.y + cropState.h - HANDLE_SIZE / 2 }]} {...brPan.panHandlers}>
              <View style={styles.cornerBR} />
            </View>
          </>
        )}
      </View>

      <View style={styles.toolbar}>
        <Pressable style={styles.toolBtn} onPress={handleRotate}>
          <Text style={styles.toolIcon}>↻</Text>
          <Text style={styles.toolLabel}>{t('cropRotate')}</Text>
        </Pressable>
        <Pressable style={styles.toolBtn} onPress={toggleAspect}>
          <Text style={[styles.toolIcon, aspectLock && styles.toolIconActive]}>◻</Text>
          <Text style={[styles.toolLabel, aspectLock && styles.toolLabelActive]}>{t('cropAspect')}</Text>
        </Pressable>
        <Pressable style={styles.toolBtn} onPress={resetCrop}>
          <Text style={styles.toolIcon}>↺</Text>
          <Text style={styles.toolLabel}>{t('cropReset')}</Text>
        </Pressable>
      </View>

      <View style={styles.bottomArea}>
        <Pressable style={styles.continueBtn} onPress={handleContinue}>
          <Text style={styles.continueBtnText}>{t('cropContinue')}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  backArrow: { fontSize: 22, fontWeight: '700', color: COLORS.text },
  topTitle: { color: COLORS.text, fontWeight: '900', fontSize: 17 },
  imageArea: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  dim: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  border: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  gridV: {
    position: 'absolute',
    width: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  gridH: {
    position: 'absolute',
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  handle: {
    position: 'absolute',
    width: HANDLE_SIZE,
    height: HANDLE_SIZE,
    zIndex: 10,
  },
  cornerTL: { position: 'absolute', top: 0, left: 0, width: HANDLE_SIZE, height: 4, backgroundColor: '#FFF', borderRadius: 2 },
  cornerTR: { position: 'absolute', top: 0, right: 0, width: 4, height: HANDLE_SIZE, backgroundColor: '#FFF', borderRadius: 2 },
  cornerBL: { position: 'absolute', bottom: 0, left: 0, width: 4, height: HANDLE_SIZE, backgroundColor: '#FFF', borderRadius: 2 },
  cornerBR: { position: 'absolute', bottom: 0, right: 0, width: HANDLE_SIZE, height: 4, backgroundColor: '#FFF', borderRadius: 2 },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: SPACING * 2,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  toolBtn: { alignItems: 'center', gap: 4 },
  toolIcon: { fontSize: 22, color: COLORS.text, fontWeight: '700' },
  toolIconActive: { color: COLORS.primary },
  toolLabel: { fontSize: 12, fontWeight: '600', color: COLORS.textMuted },
  toolLabelActive: { color: COLORS.primary, fontWeight: '700' },
  bottomArea: {
    paddingHorizontal: SPACING,
    paddingBottom: 20,
    paddingTop: 10,
    backgroundColor: COLORS.card,
  },
  continueBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  continueBtnText: { color: '#fff', fontWeight: '900', fontSize: 16, letterSpacing: 0.3 },
});
