// shared/ui/image/FastImage.tsx
import FastImageLib, {
  FastImageProps,
  ImageStyle as FastImageStyle,
  Priority,
  ResizeMode,
} from '@d11/react-native-fast-image';
import React, { memo, useCallback, useState } from 'react';
import { DimensionValue, StyleSheet } from 'react-native';

/**
 * FastImage
 * -----------------------------------------------------------------------------
 * - react-native-fast-image를 래핑한 최적화된 이미지 컴포넌트
 * - 기본 Image를 완전히 대체 가능
 * - useLastImageAsDefaultSource: true로 새로고침 시 깜빡임 방지
 * - 캐싱, 우선순위, 리사이즈 모드 등 고급 기능 제공
 */

type Props = Omit<FastImageProps, 'style' | 'onError'> & {
  /** 이미지 스타일 */
  style?: FastImageStyle;

  /** 에러 핸들러 */
  onError?: () => void;

  /** 너비 */
  width?: DimensionValue;

  /** 높이 */
  height?: DimensionValue;

  /** 보더 반지름 */
  borderRadius?: number;

  /** 배경색 (로딩 중 표시) */
  backgroundColor?: string;

  /** 리사이즈 모드 */
  resizeMode?: 'contain' | 'cover' | 'stretch' | 'center';

  /** 우선순위 */
  priority?: 'low' | 'normal' | 'high';

  /** 캐시 제어 */
  cache?: 'immutable' | 'web' | 'cacheOnly';
};

export const FastImage = memo(function FastImage(props: Props) {
  const {
    width,
    height,
    borderRadius,
    backgroundColor,
    resizeMode = 'cover',
    priority = 'normal',
    cache = 'immutable',
    style,
    source,
    onError,
    ...rest
  } = props;

  // 만약 이미지 로드에 실패하면(메모리 부족 등), 캐시를 비우고 1회 재시도하기 위한 키
  const [retryKey, setRetryKey] = useState(0);

  const handleLoadError = useCallback(() => {
    // 첫 번째 에러 발생 시 메모리 캐시 정리 후 재시도
    if (retryKey === 0) {
      clearMemoryCache().then(() => {
        setRetryKey(prev => prev + 1);
      });
      // 재시도 중이므로 에러 전파 생략
      return;
    }
    // 상위에서 전달받은 onError가 있다면 실행
    if (onError) {
      onError();
    }
  }, [retryKey, onError]);

  // 리사이즈 모드 매핑
  const fastImageResizeMode: ResizeMode = {
    contain: FastImageLib.resizeMode.contain,
    cover: FastImageLib.resizeMode.cover,
    stretch: FastImageLib.resizeMode.stretch,
    center: FastImageLib.resizeMode.center,
  }[resizeMode];

  // 우선순위 매핑
  const fastImagePriority: Priority = {
    low: FastImageLib.priority.low,
    normal: FastImageLib.priority.normal,
    high: FastImageLib.priority.high,
  }[priority];

  // 캐시 매핑
  const fastImageCache = {
    immutable: FastImageLib.cacheControl.immutable,
    web: FastImageLib.cacheControl.web,
    cacheOnly: FastImageLib.cacheControl.cacheOnly,
  }[cache];

  // 스타일 조합
  const computedStyle: FastImageStyle = {
    ...(width && { width }),
    ...(height && { height }),
    ...(borderRadius && { borderRadius }),
    ...(backgroundColor && { backgroundColor: backgroundColor }),
    ...StyleSheet.flatten(style),
  };

  // source가 문자열인 경우 객체로 변환 (presigned URL 안전성 보장)
  const fastImageSource =
    typeof source === 'string'
      ? {
          uri: source, // URL 재인코딩 방지 - 원본 그대로 사용
          priority: fastImagePriority,
          cache: fastImageCache,
          // presigned URL을 위한 안전한 헤더 설정
          headers: {
            Accept: 'image/webp,image/apng,image/*,*/*;q=0.8',
            'Cache-Control': 'no-cache', // presigned URL은 캐시하지 않음
            'User-Agent': 'Mozilla/5.0 (compatible; React Native FastImage)',
          },
        }
      : typeof source === 'object' && source !== null && 'uri' in source
        ? {
            uri: source.uri, // URI 재인코딩 방지
            priority: source.priority || fastImagePriority,
            cache: source.cache || fastImageCache,
            // 기존 헤더 유지하되 presigned URL 안전성 추가
            headers: {
              Accept: 'image/webp,image/apng,image/*,*/*;q=0.8',
              'Cache-Control': 'no-cache',
              'User-Agent': 'Mozilla/5.0 (compatible; React Native FastImage)',
              ...(source.headers || {}), // 기존 헤더 우선
            },
          }
        : source;

  return (
    <FastImageLib
      key={retryKey}
      {...rest}
      source={fastImageSource}
      style={computedStyle}
      resizeMode={fastImageResizeMode}
      onError={handleLoadError}
      // 기본 설정들
      fallback={false} // 메모리 부족 시 fallback(Image)도 같이 죽으므로, 차라리 끄고 재시도 로직에 의존함
    />
  );
});

// 편의를 위한 리사이즈 모드 상수 export
export const ImageResizeMode = {
  contain: 'contain' as const,
  cover: 'cover' as const,
  stretch: 'stretch' as const,
  center: 'center' as const,
};

// 편의를 위한 우선순위 상수 export
export const ImagePriority = {
  low: 'low' as const,
  normal: 'normal' as const,
  high: 'high' as const,
};

// 편의를 위한 캐시 제어 상수 export
export const ImageCache = {
  immutable: 'immutable' as const,
  web: 'web' as const,
  cacheOnly: 'cacheOnly' as const,
};

// FastImage 라이브러리의 캐시 관리 함수 export
// null 체크 및 try-catch로 안전하게 호출
export const clearMemoryCache = () => {
  try {
    if (
      FastImageLib &&
      FastImageLib.clearMemoryCache &&
      typeof FastImageLib.clearMemoryCache === 'function'
    ) {
      return FastImageLib.clearMemoryCache();
    }
    console.warn('[FastImage] clearMemoryCache not available');
    return Promise.resolve();
  } catch (error) {
    console.warn('[FastImage] clearMemoryCache error:', error);
    return Promise.resolve();
  }
};

export const clearDiskCache = () => {
  try {
    if (
      FastImageLib &&
      FastImageLib.clearDiskCache &&
      typeof FastImageLib.clearDiskCache === 'function'
    ) {
      return FastImageLib.clearDiskCache();
    }
    console.warn('[FastImage] clearDiskCache not available');
    return Promise.resolve();
  } catch (error) {
    console.warn('[FastImage] clearDiskCache error:', error);
    return Promise.resolve();
  }
};

export const preload = (
  sources: Array<{ uri: string; headers?: { [key: string]: string } }>,
) => {
  try {
    if (
      FastImageLib &&
      FastImageLib.preload &&
      typeof FastImageLib.preload === 'function'
    ) {
      return FastImageLib.preload(sources);
    }
    console.warn('[FastImage] preload not available');
    return Promise.resolve([]);
  } catch (error) {
    console.warn('[FastImage] preload error:', error);
    return Promise.resolve([]);
  }
};

FastImage.displayName = 'FastImage';

export default FastImage;
