// 폰트 파일명과 실제 사용할 이름을 매핑합니다.
// 폰트가 추가되면 이 객체에 키와 값을 추가해주세요.
export const FontConfig = {
  'NotoSans-Black': 'NotoSansKR-Black',
  'NotoSans-Bold': 'NotoSansKR-Bold',
  'NotoSans-Light': 'NotoSansKR-Light',
  'NotoSans-Medium': 'NotoSansKR-Medium',
  'NotoSans-Regular': 'NotoSansKR-Regular',
  'NotoSans-Thin': 'NotoSansKR-Thin',
} as const;

// FontConfig의 키를 타입으로 추출하여 자동완성을 지원합니다.
export type FontType = keyof typeof FontConfig;
