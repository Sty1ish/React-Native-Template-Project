import React from 'react';
import {Text, TextProps, TextStyle} from 'react-native';
import {FontConfig, FontType} from '../asset/font/fontConfig';

export interface BaseTextProps extends TextProps {
  /**
   * 사용할 폰트 타입을 지정합니다.
   * `src/shared/config/fontConfig.ts`에 정의된 키값을 사용합니다.
   */
  font?: FontType;
  /** 텍스트 색상 (style보다 우선 적용) */
  color?: string;
  /** 텍스트 크기 (style보다 우선 적용) */
  fontSize?: number;
  /** 텍스트 정렬 (style보다 우선 적용) */
  textAlign?: TextStyle['textAlign'];
}

/**
 * 프로젝트 표준 텍스트 컴포넌트입니다.
 * 설정 파일(fontConfig)을 통해 폰트를 관리하므로 확장성이 높습니다.
 * 색상, 크기, 정렬을 props로 직접 제어할 수 있습니다.
 *
 * @example
 * <BaseText font="NotoSans-Bold" color="red" fontSize={16}>안녕하세요</BaseText>
 */
export const BaseText = ({
  font = 'NotoSans-Regular',
  color,
  fontSize,
  textAlign,
  style,
  ...props
}: BaseTextProps) => {
  // style보다 우선순위를 높이기 위해 배열의 마지막에 추가합니다.
  // 값이 undefined인 경우 빈 객체가 되어 style의 값이 적용됩니다.
  const additionalStyles: TextStyle = {
    ...(color !== undefined && {color}),
    ...(fontSize !== undefined && {fontSize}),
    ...(textAlign !== undefined && {textAlign}),
  };

  return (
    <Text
      style={[
        {fontFamily: FontConfig[font]}, // 기본 폰트 설정
        style,                          // 사용자가 전달한 style
        additionalStyles,               // 직접 전달된 Prop (최우선 순위)
      ]}
      {...props}
    />
  );
};
