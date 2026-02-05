import React, { memo, useState, useRef } from 'react';
import { Pressable, Modal, Dimensions } from 'react-native';
import { AutoLayout } from './AutoLayout';
import { BaseText } from './BaseText';
import ArrowDownIcon from '../asset/image/svg/arrowDown.svg';

export interface DropdownOption {
    value: string;
    label: string;
}

export interface DropdownColors {
    triggerText?: string;
    arrowIcon?: string;
    menuBackground?: string;
    menuBorder?: string;
    optionBackgroundSelected?: string;
    optionTextSelected?: string;
    optionTextUnselected?: string;
}

interface DropdownProps {
    /** 드롭다운 옵션들 */
    options: DropdownOption[];
    /** 현재 선택된 값 */
    selectedValue: string;
    /** 값 변경 시 호출되는 함수 */
    onValueChange: (value: string) => void;
    /** 컴포넌트 색상 (커스텀) */
    colors?: DropdownColors;
}

const defaultColors: Required<DropdownColors> = {
    triggerText: '#000000',
    arrowIcon: '#8E8E93',
    menuBackground: '#FFFFFF',
    menuBorder: '#E5E5EA',
    optionBackgroundSelected: '#E5E5EA',
    optionTextSelected: '#000000',
    optionTextUnselected: '#8E8E93',
};

/**
 * Dropdown 컴포넌트 (gluestack-ui Menu 스타일)
 * - 재사용 가능한 드롭다운 메뉴
 * - 기존 API 유지하면서 gluestack-ui Menu 스타일로 구현
 * - 아래로 떨어지는 메뉴 방식
 */
export const Dropdown = memo<DropdownProps>(function Dropdown({
    options,
    selectedValue,
    onValueChange,
    colors,
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [dropdownPosition, setDropdownPosition] = useState({ left: 0, top: 0, width: 0 });
    const buttonRef = useRef<any>(null);

    // 테마 병합
    const theme = { ...defaultColors, ...colors };

    // 선택된 옵션 찾기
    const selectedOption = options.find(option => option.value === selectedValue);

    // 옵션 선택 핸들러
    const handleOptionSelect = (value: string) => {
        onValueChange(value);
        setIsOpen(false);
    };

    // 드롭다운 열기 시 버튼 위치 측정 (measureInWindow 사용으로 안정적인 좌표 계산)
    const handleOpenDropdown = () => {
        if (buttonRef.current) {
            // measureInWindow는 항상 화면(window) 기준 좌표를 반환하여 더 안정적
            buttonRef.current.measureInWindow((windowX: number, windowY: number, width: number, height: number) => {
                const screenWidth = Dimensions.get('window').width;
                const screenHeight = Dimensions.get('window').height;
                
                // 기본 드롭다운 크기
                const dropdownWidth = Math.max(width, 150); // 최소 150px
                const estimatedHeight = Math.min(options.length * 44, 200); // 최대 200px

                // 좌우 위치 계산 (버튼과 동일한 시작점)
                let left = windowX;
                
                // 오른쪽 경계 체크
                if (left + dropdownWidth > screenWidth - 16) {
                    left = screenWidth - dropdownWidth - 16;
                }
                
                // 왼쪽 경계 체크  
                if (left < 16) {
                    left = 16;
                }

                // 상하 위치 계산 (버튼 바로 아래 5px 간격, gluestack-ui offset={5} 스타일)
                let top = windowY + height + 5;
                
                // 하단 경계 체크 (화면을 벗어나면 버튼 위로)
                if (top + estimatedHeight > screenHeight - 50) {
                    top = windowY - estimatedHeight - 5;
                }

                setDropdownPosition({ left, top, width: dropdownWidth });
                setIsOpen(true);
            });
        }
    };

    return (
        <>
            {/* 트리거 버튼 */}
            <Pressable ref={buttonRef} onPress={handleOpenDropdown}>
                <AutoLayout
                    axis="horizontal"
                    align="center"
                    gap={4}
                >
                    <BaseText fontSize={13} color={theme.triggerText}>
                        {selectedOption?.label || '선택하세요'}
                    </BaseText>
                    <ArrowDownIcon width={16} height={16} color={theme.arrowIcon} />
                </AutoLayout>
            </Pressable>

            {/* 드롭다운 메뉴 (Modal) */}
            <Modal
                visible={isOpen}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setIsOpen(false)}
            >
                {/* 배경 터치로 닫기 */}
                <Pressable
                    style={{ flex: 1, backgroundColor: 'transparent' }}
                    onPress={() => setIsOpen(false)}
                >
                    {/* 메뉴 컨테이너 */}
                    <AutoLayout
                        axis="vertical"
                        bg={theme.menuBackground}
                        radius={8}
                        style={{
                            position: 'absolute',
                            left: dropdownPosition.left,
                            top: dropdownPosition.top,
                            width: dropdownPosition.width,
                            maxHeight: 200,
                            // gluestack-ui 스타일의 그림자
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.1,
                            shadowRadius: 12,
                            elevation: 8,
                            borderWidth: 1,
                            borderColor: theme.menuBorder,
                        }}
                    >
                        {options.map((option, index) => (
                            <Pressable
                                key={option.value}
                                onPress={() => handleOptionSelect(option.value)}
                                style={{ width: '100%' }}
                            >
                                <AutoLayout
                                    w="fill"
                                    px={12}
                                    py={8}
                                    bg={selectedValue === option.value ? theme.optionBackgroundSelected : 'transparent'}
                                    style={{
                                        borderTopLeftRadius: index === 0 ? 8 : 0,
                                        borderTopRightRadius: index === 0 ? 8 : 0,
                                        borderBottomLeftRadius: index === options.length - 1 ? 8 : 0,
                                        borderBottomRightRadius: index === options.length - 1 ? 8 : 0,
                                    }}
                                >
                                    <BaseText
                                        fontSize={12}
                                        color={selectedValue === option.value ? theme.optionTextSelected : theme.optionTextUnselected}
                                        numberOfLines={1}
                                    >
                                        {option.label}
                                    </BaseText>
                                </AutoLayout>
                            </Pressable>
                        ))}
                    </AutoLayout>
                </Pressable>
            </Modal>
        </>
    );
});

Dropdown.displayName = 'Dropdown';
