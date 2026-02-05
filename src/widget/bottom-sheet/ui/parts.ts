// 안전한 사용을 위해 gorhom/bottom-sheet의 컴포넌트들을 래핑/재내보내기 합니다.
// 개발자는 이 파일에서 import 하여 사용해야 합니다.

// 라이브러리의 컴포넌트 이름을 그대로 사용합니다.
export {
  BottomSheetTextInput,
  BottomSheetView,
  BottomSheetScrollView,
  BottomSheetFlatList,
  BottomSheetSectionList,
  BottomSheetFooter,
} from '@gorhom/bottom-sheet';

// 필요한 경우 커스텀 버튼 등도 여기서 정의해서 export 가능
// export const BSButton = ...
