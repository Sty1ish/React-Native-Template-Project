import React, {forwardRef, memo, useMemo} from 'react';
import {
  View,
  ViewProps,
  StyleSheet,
  ViewStyle,
  ImageStyle,
  ImageSourcePropType,
  ImageResizeMode,
  ImageBackground,
} from 'react-native';

/** 교차축 정렬: Figma Align items */
type Align = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
/** 주축 분배 */
type Justify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
/** Figma Hug / Fill */
type SizeMode = 'hug' | 'fill';
/** 설탕 프리셋 */
type Preset = 'center' | 'rowCenter' | 'rowBetween' | 'columnCenter';

export type AutoLayoutProps = ViewProps & {
  // ---------- [children] ----------
  axis?: 'horizontal' | 'vertical';
  gap?: number;

  padding?: number;
  px?: number;
  py?: number;
  pt?: number;
  pr?: number;
  pb?: number;
  pl?: number;

  align?: Align;
  justify?: Justify;
  wrap?: boolean;

  // ---------- [self] ----------
  w?: SizeMode;
  h?: SizeMode;
  width?: number;
  height?: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  aspectRatio?: number;

  /** 메인축 남은 공간 채우기 → flex:1 */
  grow?: boolean;
  /** 수축 허용 */
  shrink?: boolean;

  /** 별칭: cross/main 직접 100% */
  fullWidth?: boolean; // width: '100%'
  fullHeight?: boolean; // height: '100%'

  // ---------- margin/position ----------
  m?: number;
  mx?: number;
  my?: number;
  mt?: number;
  mr?: number;
  mb?: number;
  ml?: number;
  position?: 'absolute' | 'relative';
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
  zIndex?: number;

  // ---------- visual ----------
  bg?: string;
  bgOpacity?: number;

  radius?: number;
  radiusTopLeft?: number;
  radiusTopRight?: number;
  radiusBottomLeft?: number;
  radiusBottomRight?: number;

  borderColor?: string;
  borderWidth?: number;
  borderStyle?: 'solid' | 'dashed' | 'dotted';

  borderXWidth?: number;
  borderYWidth?: number;

  borderTopWidth?: number;
  borderRightWidth?: number;
  borderBottomWidth?: number;
  borderLeftWidth?: number;
  borderTopColor?: string;
  borderRightColor?: string;
  borderBottomColor?: string;
  borderLeftColor?: string;

  clip?: boolean;
  opacity?: number;

  // ---------- background image ----------
  bgImage?: ImageSourcePropType;
  bgImageResizeMode?: ImageResizeMode;

  // ---------- shadow ----------
  shadowColor?: string;
  shadowOpacity?: number;
  shadowRadius?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  elevation?: number;

  // ---------- sugar ----------
  preset?: Preset;
};

const mapAlign = (v?: Align): ViewStyle['alignItems'] =>
  v === 'start'
    ? 'flex-start'
    : v === 'end'
    ? 'flex-end'
    : v === 'stretch'
    ? 'stretch'
    : v === 'baseline'
    ? 'baseline'
    : 'center';

const mapJustify = (v?: Justify): ViewStyle['justifyContent'] =>
  v === 'start'
    ? 'flex-start'
    : v === 'end'
    ? 'flex-end'
    : v === 'between'
    ? 'space-between'
    : v === 'around'
    ? 'space-around'
    : v === 'evenly'
    ? 'space-evenly'
    : 'center';

const convertColorWithOpacity = (color: string, opacity: number): string => {
  const named: Record<string, string> = {
    black: '#000',
    white: '#fff',
    red: '#f00',
    green: '#008000',
    blue: '#00f',
    yellow: '#ff0',
    orange: '#ffa500',
    purple: '#800080',
    pink: '#ffc0cb',
    gray: '#808080',
    grey: '#808080',
    brown: '#a52a2a',
    cyan: '#0ff',
    magenta: '#f0f',
    lime: '#0f0',
    navy: '#000080',
    maroon: '#800000',
    olive: '#808000',
    silver: '#c0c0c0',
    teal: '#008080',
  };
  const norm = named[color?.toLowerCase?.()] || color;
  if (norm?.startsWith?.('#')) {
    let hex = norm.slice(1);
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    if (hex.length === 6) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
  }
  if (norm?.startsWith?.('rgb')) {
    const m = norm.match(/rgba?\(([^)]+)\)/);
    if (m) {
      const [r, g, b] = m[1].split(',').map(v => v.trim());
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
  }
  return norm;
};

export const AutoLayout = memo(
  forwardRef<View, AutoLayoutProps>(function AutoLayoutMemo(p, ref) {
    const {
      axis = 'vertical',
      gap,
      padding,
      px,
      py,
      pt,
      pr,
      pb,
      pl,
      align: alignIn = 'start',
      justify: justifyIn = 'start',
      wrap,

      w = 'hug',
      h = 'hug',
      width,
      height,
      minWidth,
      minHeight,
      maxWidth,
      maxHeight,
      aspectRatio,
      grow,
      shrink,
      fullWidth,
      fullHeight,

      m,
      mx,
      my,
      mt,
      mr,
      mb,
      ml,
      position,
      top,
      right,
      bottom,
      left,
      zIndex,

      bg,
      bgOpacity,
      radius,
      radiusTopLeft,
      radiusTopRight,
      radiusBottomLeft,
      radiusBottomRight,
      borderColor,
      borderWidth,
      borderStyle,
      borderXWidth,
      borderYWidth,
      borderTopWidth,
      borderRightWidth,
      borderBottomWidth,
      borderLeftWidth,
      borderTopColor,
      borderRightColor,
      borderBottomColor,
      borderLeftColor,
      clip,
      opacity,

      bgImage,
      bgImageResizeMode = 'cover',

      shadowColor,
      shadowOpacity,
      shadowRadius,
      shadowOffsetX,
      shadowOffsetY,
      elevation,

      preset,

      style,
      children,
      ...rest
    } = p;

    // preset 기본값 주입
    let axisFinal: 'horizontal' | 'vertical' = axis;
    let align = alignIn;
    let justify = justifyIn;
    if (preset) {
      if (preset === 'center') {
        align = alignIn ?? 'center';
        justify = justifyIn ?? 'center';
      }
      if (preset === 'rowCenter') {
        axisFinal = 'horizontal';
        align = alignIn ?? 'center';
        justify = justifyIn ?? 'start';
      }
      if (preset === 'rowBetween') {
        axisFinal = 'horizontal';
        align = alignIn ?? 'center';
        justify = justifyIn ?? 'between';
      }
      if (preset === 'columnCenter') {
        axisFinal = 'vertical';
        align = alignIn ?? 'center';
        justify = justifyIn ?? 'start';
      }
    }

    // 방향 스타일
    const dirStyle = axisFinal === 'horizontal' ? styles.row : styles.col;

    // 라운드
    const radiusView: ViewStyle = useMemo(() => {
      const r: ViewStyle = {};
      if (radius != null) r.borderRadius = radius;
      if (radiusTopLeft != null) r.borderTopLeftRadius = radiusTopLeft;
      if (radiusTopRight != null) r.borderTopRightRadius = radiusTopRight;
      if (radiusBottomLeft != null) r.borderBottomLeftRadius = radiusBottomLeft;
      if (radiusBottomRight != null) r.borderBottomRightRadius = radiusBottomRight;
      return r;
    }, [radius, radiusTopLeft, radiusTopRight, radiusBottomLeft, radiusBottomRight]);

    const radiusImage: ImageStyle = useMemo(() => {
      const r: ImageStyle = {};
      if (radius != null) r.borderRadius = radius;
      if (radiusTopLeft != null) r.borderTopLeftRadius = radiusTopLeft;
      if (radiusTopRight != null) r.borderTopRightRadius = radiusTopRight;
      if (radiusBottomLeft != null) r.borderBottomLeftRadius = radiusBottomLeft;
      if (radiusBottomRight != null) r.borderBottomRightRadius = radiusBottomRight;
      return r;
    }, [radius, radiusTopLeft, radiusTopRight, radiusBottomLeft, radiusBottomRight]);

    const dyn = useMemo<ViewStyle>(() => {
      const s: ViewStyle = {};

      // children layout
      if (gap != null) s.gap = gap;
      if (padding != null) s.padding = padding;
      if (px != null) s.paddingHorizontal = px;
      if (py != null) s.paddingVertical = py;
      if (pt != null) s.paddingTop = pt;
      if (pr != null) s.paddingRight = pr;
      if (pb != null) s.paddingBottom = pb;
      if (pl != null) s.paddingLeft = pl;

      if (align) s.alignItems = mapAlign(align);
      if (justify) s.justifyContent = mapJustify(justify);
      if (wrap) s.flexWrap = 'wrap';

      // size
      const hasExplicitWidth = width != null;
      const hasExplicitHeight = height != null;
      if (hasExplicitWidth) s.width = width!;
      if (hasExplicitHeight) s.height = height!;

      if (minWidth != null) s.minWidth = minWidth;
      if (minHeight != null) s.minHeight = minHeight;
      if (maxWidth != null) s.maxWidth = maxWidth;
      if (maxHeight != null) s.maxHeight = maxHeight;
      if (aspectRatio != null) s.aspectRatio = aspectRatio;

      // ⚠️ Figma fill → 퍼센트로 직접 채움 (flex:1 사용하지 않음)
      const wantWidthFill = w === 'fill' && !hasExplicitWidth;
      const wantHeightFill = h === 'fill' && !hasExplicitHeight;
      if (wantWidthFill || fullWidth) s.width = '100%';
      if (wantHeightFill || fullHeight) s.height = '100%';

      // 남은 공간 메인축 채우기 → grow
      if (grow) {
        s.flex = 1;
        // row에서 텍스트 등으로 수평 확장 막힘 방지
        if (axisFinal === 'horizontal' && s.minWidth == null) s.minWidth = 0;
      }

      // shrink
      if (shrink) {
        s.flexShrink = 1;
        if (minWidth === 0) s.flex = 1;
      }

      // margin/position
      if (m != null) s.margin = m;
      if (mx != null) s.marginHorizontal = mx;
      if (my != null) s.marginVertical = my;
      if (mt != null) s.marginTop = mt;
      if (mr != null) s.marginRight = mr;
      if (mb != null) s.marginBottom = mb;
      if (ml != null) s.marginLeft = ml;

      if (position) s.position = position;
      if (top != null) s.top = top;
      if (right != null) s.right = right;
      if (bottom != null) s.bottom = bottom;
      if (left != null) s.left = left;
      if (zIndex != null) s.zIndex = zIndex;

      // visuals
      if (bg) {
        const a = bgOpacity ?? 1;
        s.backgroundColor = a < 1 ? convertColorWithOpacity(bg, a) : bg;
      }
      Object.assign(s, radiusView);

      if (borderStyle) s.borderStyle = borderStyle;
      if (borderColor) s.borderColor = borderColor;
      if (borderWidth != null) s.borderWidth = borderWidth;

      if (borderXWidth != null) {
        s.borderLeftWidth = borderXWidth;
        s.borderRightWidth = borderXWidth;
      }
      if (borderYWidth != null) {
        s.borderTopWidth = borderYWidth;
        s.borderBottomWidth = borderYWidth;
      }

      if (borderTopWidth != null) s.borderTopWidth = borderTopWidth;
      if (borderRightWidth != null) s.borderRightWidth = borderRightWidth;
      if (borderBottomWidth != null) s.borderBottomWidth = borderBottomWidth;
      if (borderLeftWidth != null) s.borderLeftWidth = borderLeftWidth;

      if (borderTopColor) s.borderTopColor = borderTopColor;
      if (borderRightColor) s.borderRightColor = borderRightColor;
      if (borderBottomColor) s.borderBottomColor = borderBottomColor;
      if (borderLeftColor) s.borderLeftColor = borderLeftColor;

      if (clip) s.overflow = 'hidden';
      if (opacity != null) s.opacity = opacity;

      if (shadowColor) s.shadowColor = shadowColor;
      if (shadowOpacity != null) s.shadowOpacity = shadowOpacity;
      if (shadowRadius != null) s.shadowRadius = shadowRadius;
      if ((shadowOffsetX ?? shadowOffsetY) != null) {
        s.shadowOffset = {width: shadowOffsetX ?? 0, height: shadowOffsetY ?? 0};
      }
      if (elevation != null) s.elevation = elevation;

      return s;
    }, [
      axisFinal,
      gap,
      padding,
      px,
      py,
      pt,
      pr,
      pb,
      pl,
      align,
      justify,
      wrap,
      width,
      height,
      minWidth,
      minHeight,
      maxWidth,
      maxHeight,
      aspectRatio,
      w,
      h,
      fullWidth,
      fullHeight,
      grow,
      shrink,
      m,
      mx,
      my,
      mt,
      mr,
      mb,
      ml,
      position,
      top,
      right,
      bottom,
      left,
      zIndex,
      bg,
      bgOpacity,
      radiusView,
      borderColor,
      borderWidth,
      borderStyle,
      borderXWidth,
      borderYWidth,
      borderTopWidth,
      borderRightWidth,
      borderBottomWidth,
      borderLeftWidth,
      borderTopColor,
      borderRightColor,
      borderBottomColor,
      borderLeftColor,
      clip,
      opacity,
      shadowColor,
      shadowOpacity,
      shadowRadius,
      shadowOffsetX,
      shadowOffsetY,
      elevation,
    ]);

    if (bgImage) {
      return (
        <ImageBackground
          ref={ref}
          source={bgImage}
          resizeMode={bgImageResizeMode}
          imageStyle={radiusImage}
          {...rest}
          style={[dirStyle, dyn, style]}>
          {children}
        </ImageBackground>
      );
    }

    return (
      <View ref={ref} {...rest} style={[dirStyle, dyn, style]}>
        {children}
      </View>
    );
  }),
);

const styles = StyleSheet.create({
  row: {flexDirection: 'row'},
  col: {flexDirection: 'column'},
});
