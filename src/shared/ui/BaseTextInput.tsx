import React, {forwardRef} from 'react';
import {TextInput, TextInputProps, TextStyle} from 'react-native';
import {FontConfig, FontType} from '../asset/font/fontConfig';

export interface BaseTextInputProps extends TextInputProps {
  /**
   * 사용할 폰트 타입을 지정합니다.
   * `src/shared/asset/font/fontConfig.ts`에 정의된 키값을 사용합니다.
   */
  font?: FontType;

  /** 텍스트 색상 (style보다 우선 적용) */
  color?: string;

  /** 텍스트 크기 (style보다 우선 적용) */
  fontSize?: number;

  /** 텍스트 정렬 (style보다 우선 적용) */
  textAlign?: 'left' | 'center' | 'right';

  // --- Layout & Spacing ---
  /** 내부 여백 (전체) */
  p?: number;
  /** 내부 여백 (수평: 좌우) */
  px?: number;
  /** 내부 여백 (수직: 상하) */
  py?: number;
  /** 내부 여백 (상단) */
  pt?: number;
  /** 내부 여백 (우측) */
  pr?: number;
  /** 내부 여백 (하단) */
  pb?: number;
  /** 내부 여백 (좌측) */
  pl?: number;

  /** 배경 색상 */
  bg?: string;

  // --- Border Radius ---
  /** 테두리 둥글기 (전체) */
  radius?: number;
  /** 테두리 둥글기 (좌상단) */
  radiusTopLeft?: number;
  /** 테두리 둥글기 (우상단) */
  radiusTopRight?: number;
  /** 테두리 둥글기 (좌하단) */
  radiusBottomLeft?: number;
  /** 테두리 둥글기 (우하단) */
  radiusBottomRight?: number;

  // --- Border & Outline ---
  /** 테두리 두께 (전체) */
  borderWidth?: number;
  /** 테두리 색상 (전체) */
  borderColor?: string;
  /** 테두리 두께 (상단) */
  borderTopWidth?: number;
  /** 테두리 두께 (우측) */
  borderRightWidth?: number;
  /** 테두리 두께 (하단) */
  borderBottomWidth?: number;
  /** 테두리 두께 (좌측) */
  borderLeftWidth?: number;
}

/**
 * 프로젝트 표준 TextInput 컴포넌트입니다.
 * FontConfig를 사용하여 일관된 폰트 스타일을 적용할 수 있으며,
 * 직관적인 레이아웃 Props를 제공합니다.
 *
 * @example
 * <BaseTextInput
 *   font="NotoSans-Bold"
 *   color="#333"
 *   fontSize={16}
 *   bg="#f0f0f0"
 *   px={12} py={8}
 *   radius={8}
 *   placeholder="입력하세요"
 * />
 */
export const BaseTextInput = forwardRef<TextInput, BaseTextInputProps>(
  (
    {
      font = 'NotoSans-Regular',
      color,
      fontSize,
      textAlign,
      // Spacing
      p, px, py, pt, pr, pb, pl,
      // Background
      bg,
      // Radius
      radius, radiusTopLeft, radiusTopRight, radiusBottomLeft, radiusBottomRight,
      // Border
      borderWidth, borderColor,
      borderTopWidth, borderRightWidth, borderBottomWidth, borderLeftWidth,
      
      style,
      ...props
    },
    ref,
  ) => {
    // 우선순위가 높은 차원 설정값 처리를 위해 별도 객체 생성
    const layoutStyles: TextStyle = {
      // Background
      ...(bg !== undefined && {backgroundColor: bg}),

      // Border Radius
      ...(radius !== undefined && {borderRadius: radius}),
      ...(radiusTopLeft !== undefined && {borderTopLeftRadius: radiusTopLeft}),
      ...(radiusTopRight !== undefined && {borderTopRightRadius: radiusTopRight}),
      ...(radiusBottomLeft !== undefined && {borderBottomLeftRadius: radiusBottomLeft}),
      ...(radiusBottomRight !== undefined && {borderBottomRightRadius: radiusBottomRight}),

      // Border
      ...(borderColor !== undefined && {borderColor}),
      ...(borderWidth !== undefined && {borderWidth}),
      ...(borderTopWidth !== undefined && {borderTopWidth}),
      ...(borderRightWidth !== undefined && {borderRightWidth}),
      ...(borderBottomWidth !== undefined && {borderBottomWidth}),
      ...(borderLeftWidth !== undefined && {borderLeftWidth}),
    };

    // Padding (높은 차원 값이 있으면 낮은 차원 값은 무시되므로 순서 중요하지 않음 - RN은 구체적인 속성이 우선)
    // 하지만 RN에서는 padding과 paddingVertical이 같이 있으면 paddingVertical이 우선됨.
    // 여기서는 명시적으로 값을 병합함.
    
    if (p !== undefined) layoutStyles.padding = p;
    if (px !== undefined) layoutStyles.paddingHorizontal = px;
    if (py !== undefined) layoutStyles.paddingVertical = py;
    if (pt !== undefined) layoutStyles.paddingTop = pt;
    if (pr !== undefined) layoutStyles.paddingRight = pr;
    if (pb !== undefined) layoutStyles.paddingBottom = pb;
    if (pl !== undefined) layoutStyles.paddingLeft = pl;

    // style보다 우선순위를 높이기 위해 별도 객체 생성
    const additionalStyles: TextStyle = {
      ...(color !== undefined && {color}),
      ...(fontSize !== undefined && {fontSize}),
      ...(textAlign !== undefined && {textAlign}),
    };

    return (
      <TextInput
        ref={ref}
        style={[
          {
            fontFamily: FontConfig[font],
            padding: 0, // Android 기본 패딩 제거
            margin: 0, // Android 기본 마진 제거
            textAlignVertical: 'center', // Android 수직 정렬 보장
            includeFontPadding: false, // Android 폰트 내부 여백 제거 (위치 틀어짐 방지)
          },
          style,
          layoutStyles, // 레이아웃/스타일 Props 적용
          additionalStyles,
        ]}
        placeholderTextColor={props.placeholderTextColor ?? '#999'} // 기본 placeholder 색상 지정
        {...props}
      />
    );
  },
);

BaseTextInput.displayName = 'BaseTextInput';
