import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { useUserStore } from '../store/userStore';

// dayjs 플러그인 로드
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

export type DateInput = string | number | Date | null | undefined;

interface FormatDateOptions {
    /** 
     * 변환할 목표 시간대 
     * @default UserStore.device.timezone (기기 시간대)
     */
    targetTimezone?: string;
    
    /** 
     * 입력값이 이미 특정 시간대로 되어있는 경우 지정 
     * (지정하지 않으면 입력값을 로컬 시간 또는 UTC ISO 문자열로 간주)
     */
    sourceTimezone?: string;
}

/**
 * 날짜 포맷팅 유틸리티
 * 
 * SQL 스타일 포맷 문자 지원:
 * - %Y: 연도 (YYYY)
 * - %m: 월 (MM)
 * - %d: 일 (DD)
 * - %H: 시간 (HH 24시간)
 * - %M: 분 (mm)
 * - %S: 초 (ss)
 * 
 * @param date - 입력 날짜 (Date 객체, 타임스탬프 숫자, ISO 문자열)
 * @param formatStr - 출력 포맷 (기본값: 'YYYY-MM-DD', SQL 스타일 포맷 문자도 지원)
 * @param options - 시간대 설정 옵션
 */
export const formatDate = (
    date: DateInput,
    formatStr: string = 'YYYY-MM-DD',
    options?: FormatDateOptions
): string => {
    if (!date) return '';

    // 1. SQL 스타일 포맷(%Y)을 Day.js 포맷(YYYY)으로 변환
    const dayjsFormat = convertSqlFormatToDayjs(formatStr);

    // 2. 현재 앱의 전역 기기 시간대 가져오기 (Hook 규칙을 따르지 않으므로 getState 사용)
    const deviceTimezone = useUserStore.getState().device.timezone || 'Asia/Seoul';
    const targetTz = options?.targetTimezone || deviceTimezone;

    let dayjsObj = dayjs(date);

    // 유효하지 않은 날짜 처리
    if (!dayjsObj.isValid()) return '';

    // 3. 소스 시간대가 명시된 경우 해당 시간대로 해석
    if (options?.sourceTimezone) {
        dayjsObj = dayjs.tz(date, options.sourceTimezone);
    }

    // 4. 목표 시간대로 변환 후 포맷팅
    // (UTC로 변환 후 -> 원하는 타임존으로 다시 변환)
    return dayjsObj.tz(targetTz).format(dayjsFormat);
};

/**
 * SQL 스타일 형식 문자열(%Y, %m 등)을 Day.js 형식(YYYY, MM 등)으로 변환
 */
const convertSqlFormatToDayjs = (format: string): string => {
    return format
        .replace(/%Y/g, 'YYYY')
        .replace(/%y/g, 'YY')
        .replace(/%m/g, 'MM')
        .replace(/%d/g, 'DD')
        .replace(/%H/g, 'HH') // 24시간
        .replace(/%I/g, 'hh') // 12시간
        .replace(/%M/g, 'mm')
        .replace(/%S/g, 'ss')
        .replace(/%p/g, 'A');  // AM/PM
};

/**
 * 현재 기기 시간(타임존 적용)을 반환
 */
export const getNow = (): dayjs.Dayjs => {
    const deviceTimezone = useUserStore.getState().device.timezone || 'Asia/Seoul';
    return dayjs().tz(deviceTimezone);
};
