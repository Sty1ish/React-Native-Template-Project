module.exports = {
  root: true,
  extends: '@react-native',
  plugins: ['import'],
  rules: {
    // import 순서 자동 정렬
    'import/order': [
      'error',
      {
        groups: [
          'builtin', // node "fs", "path" 등
          'external', // 외부 라이브러리 (react, react-native 등)
          'internal', // 내부 모듈 (src/...)
          ['parent', 'sibling', 'index'], // 상대 경로
          'object',
          'type',
        ],
        'newlines-between': 'always', // 그룹 간 개행 추가
        alphabetize: {
          order: 'asc', // 알파벳 오름차순
          caseInsensitive: true,
        },
      },
    ],
    // 불필요한 import 제거 (기본적으로 TS/ESLint가 잡지만 명시적으로 에러 처리)
    'no-unused-vars': 'off', // TS에서 처리하므로 끔
    '@typescript-eslint/no-unused-vars': ['error'],
  },
};
