# Global Bottom Sheet (전역 바텀 시트)

이 모듈은 `@gorhom/bottom-sheet` 라이브러리를 기반으로 하며, **"앱 전역에서 단 하나만 실행되는 바텀 시트 (Single Instance)"** 패턴을 구현하고 있습니다.

중복 실행(Double Click 등)을 원천적으로 방지하고, 일관된 UI/UX를 제공하기 위해 설계되었습니다.

---

## 🚀 사용법 (How to Use)

### 1. 바텀 시트 열기
`useBottomSheetStore` 훅의 `open` 함수를 사용하여 바텀 시트를 엽니다.

```tsx
import { useBottomSheetStore } from '@/widget/bottom-sheet';
import { MyContent } from './MyContent'; // 직접 만든 컴포넌트

const Component = () => {
  const openSheet = useBottomSheetStore(state => state.open);

  const handlePress = () => {
    openSheet(<MyContent />, {
      // 옵션 (Optional)
      snapPoints: ['50%', '90%'], // 높이 설정
      backdropOpacity: 0.5,       // 배경 투명도
      backdropPressBehavior: 'close', // 배경 클릭 시 동작 ('close' | 'none' | 'collapse')
    });
  };

  return <Button onPress={handlePress} title="열기" />;
};
```

### 2. 바텀 시트 닫기
일반적으로 배경을 누르거나 제스처로 닫지만, 코드로 닫아야 할 경우 `close`를 사용합니다.

```tsx
const closeSheet = useBottomSheetStore(state => state.close);
// ...
closeSheet();
```

---

## 🛠 컴포넌트 제작 가이드 (Design & Development)

**⚠️ 중요:** 바텀 시트 내부에서는 반드시 **`@/widget/bottom-sheet`에서 제공하는 전용 컴포넌트**를 사용해야 합니다.
일반 `View`, `TextInput`, `ScrollView`를 사용할 경우 **제스처 충돌, 스크롤 불가, 키보드 가림 현상**이 발생합니다.

### 사용 가능한 컴포넌트 (Available Components)
`@/widget/bottom-sheet`에서 바로 import 하여 사용하세요.

| 컴포넌트 | 설명 | RN 대체 |
|:---:|:---|:---:|
| `BottomSheetView` | 기본 컨테이너. 내부 레이아웃을 잡을 때 사용합니다. | `View` |
| `BottomSheetScrollView` | 스크롤이 필요한 경우 사용합니다. (제스처 연동됨) | `ScrollView` |
| `BottomSheetFlatList` | 대량의 데이터를 리스트로 보여줄 때 사용합니다. | `FlatList` |
| `BottomSheetTextInput` | 키보드 회피 기능이 내장된 입력창입니다. (한글 깨짐 방지) | `TextInput` |
| `BottomSheetFooter` | 바텀 시트 하단에 고정되는 뷰를 만들 때 사용합니다. | - |

### 예시 코드 (컴포넌트 구현)

```tsx
import React from 'react';
import { StyleSheet } from 'react-native';
// ✅ 반드시 여기서 가져옵니다.
import { BottomSheetView, BottomSheetTextInput, BottomSheetScrollView } from '@/widget/bottom-sheet';

export const ReviewWriteSheet = () => {
  return (
    <BottomSheetView style={styles.container}>
      <BottomSheetScrollView>
        <BaseText>리뷰 작성</BaseText>
        
        {/* ✅ 전용 Input 사용 */}
        <BottomSheetTextInput 
          placeholder="내용을 입력해주세요"
          style={styles.input} 
        />
      </BottomSheetScrollView>
    </BottomSheetView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  input: {
    marginTop: 8,
    marginBottom: 10,
    borderRadius: 10,
    fontSize: 16,
    lineHeight: 20,
    padding: 8,
    backgroundColor: 'rgba(151, 151, 151, 0.25)',
  },
});
```

---

## ⚙️ 상세 옵션 (Configuration)

### Snap Points (높이 설정)
바텀 시트가 멈추는 지점을 설정합니다. `%` 또는 `픽셀(number)`로 설정 가능합니다.
- 기본값: `['50%']`
- 예시: `['25%', '50%', '90%']` (3단계 조절)

### Backdrop (배경 설정)
- `backdropOpacity`: 배경의 어두운 정도 (0.0 ~ 1.0)
- `backdropPressBehavior`:
  - `'close'`: 배경을 누르면 닫힘 (기본값)
  - `'none'`: 배경을 눌러도 반응 없음 (강제 입력 필요 시)
  - `'collapse'`: 제일 낮은 Snap Point로 내려감

---

## 🚫 주의사항 (Constraints)

1.  **중복 호출 금지**
    - 현재 바텀 시트가 열려있는 상태에서 `open()`을 다시 호출하면 경고 메시지와 함께 무시됩니다.
    - 다른 바텀 시트를 띄우려면 먼저 `close()`를 호출해야 합니다.

2.  **SafeAreaView 사용 금지**
    - `globalBottomSheet`에서 이미 SafeArea 처리가 고려되어 있습니다. 내부 컴포넌트에서 `SafeAreaView`를 또 쓰면 이중으로 여백이 생길 수 있습니다. 필요하다면 `View`에 `paddingBottom`을 주는 방식을 권장합니다.

3.  **키보드 처리**
    - `GlobalBottomSheet`에 `keyboardBehavior="interactive"`가 설정되어 있습니다.
    - 입력창이 있다면 반드시 `BottomSheetTextInput`을 사용해야 정상 작동합니다.
