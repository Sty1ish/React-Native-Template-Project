---
description: '**'
# applyTo: 'Describe when these instructions should be loaded' # when provided, instructions will automatically be added to the request context when the pattern matches an attached file
---

## ScrollView, Flatlist 사용지침

- ScrollView, Flatlist를 사용할때, Anmimated.ScrollView, Animated.Flatlist를 사용해야할지 고민합니다
- 기본적으로는 Animated 컴포넌트 사용을 고려하지만, 연산이나 동작상 문제가 발생할 가능성이 매우 농후한 경우에는 일반 컴포넌트를 사용합니다
- Animated 컴포넌트 사용시, 불필요한 리렌더링이 발생하지 않도록 주의합니다
- Animated 컴포넌트 사용시, 성능 최적화를 위해 필요한 경우에만 사용하며, 불필요한 애니메이션 효과는 피합니다
- Flatlist 사용시, keyExtractor를 반드시 정의하여 각 아이템의 고유성을 보장합니다
- Flatlist의 성능 최적화를 위해 getItemLayout, initialNumToRender, maxToRenderPerBatch 등의 속성을 적절히 설정합니다
