import RNFS from 'react-native-fs';
import { Platform, PermissionsAndroid } from 'react-native';
import RNFetchBlob from 'react-native-blob-util';

/**
 * 파일 다운로드를 위한 유틸리티 클래스
 */
export class FileDownloadService {
    /**
     * Android에서 파일 쓰기 권한을 확인하고 요청합니다
     *
     * Android 버전별 권한 정책:
     * - Android 9 이하 (API ≤28): WRITE_EXTERNAL_STORAGE 필수
     * - Android 10+ (API ≥29): DownloadManager/MediaStore 사용 시 권한 불필요 (Scoped Storage)
     */
    private static async requestStoragePermission(): Promise<boolean> {
        if (Platform.OS !== 'android') {
            return true; // iOS는 별도 권한이 필요 없음
        }

        try {
            console.log('[FileDownloadService] Android API Level:', Platform.Version);

            // Android 10 (API 29) 이상: DownloadManager 사용 시 권한 불필요
            if (Platform.Version >= 29) {
                console.log(
                    '[FileDownloadService] Android 10+ (Scoped Storage) - DownloadManager 사용으로 권한 불필요',
                );
                return true;
            }

            // Android 9 이하: WRITE_EXTERNAL_STORAGE 필수
            console.log('[FileDownloadService] Android 9 이하 - WRITE_EXTERNAL_STORAGE 권한 요청');
            const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE, {
                title: '파일 저장 권한',
                message: '파일을 다운로드하기 위해 저장소 접근 권한이 필요합니다.',
                buttonNeutral: '나중에',
                buttonNegative: '취소',
                buttonPositive: '확인',
            });

            console.log('[FileDownloadService] WRITE_EXTERNAL_STORAGE 권한 결과:', granted);
            return granted === PermissionsAndroid.RESULTS.GRANTED;
        } catch (error) {
            console.error('[FileDownloadService] 권한 요청 실패:', error);
            return false;
        }
    }

    /**
     * 안전한 파일명을 생성합니다 (특수문자 제거)
     */
    private static sanitizeFileName(fileName: string): string {
        // 파일시스템에서 허용되지 않는 문자들을 제거
        return fileName.replace(/[<>:"/\\|?*]/g, '_');
    }

    /**
     * 파일명에서 MIME 타입을 추정합니다
     */
    private static getMimeType(fileName: string): string {
        const ext = (fileName.split('.').pop() || '').toLowerCase();
        switch (ext) {
            case 'jpg':
            case 'jpeg':
                return 'image/jpeg';
            case 'png':
                return 'image/png';
            case 'gif':
                return 'image/gif';
            case 'webp':
                return 'image/webp';
            case 'pdf':
                return 'application/pdf';
            case 'txt':
                return 'text/plain';
            case 'csv':
                return 'text/csv';
            case 'json':
                return 'application/json';
            case 'zip':
                return 'application/zip';
            case 'doc':
                return 'application/msword';
            case 'docx':
                return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            case 'xls':
                return 'application/vnd.ms-excel';
            case 'xlsx':
                return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            case 'ppt':
                return 'application/vnd.ms-powerpoint';
            case 'pptx':
                return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
            default:
                return 'application/octet-stream';
        }
    }

    /**
     * 다운로드 경로를 결정합니다 (기종별 안전한 경로 순서대로 시도)
     */
    private static async getDownloadPaths(fileName: string): Promise<string[]> {
        const sanitizedFileName = this.sanitizeFileName(fileName);
        const paths: string[] = [];

        if (Platform.OS === 'android') {
            // Android에서 시도할 경로들 (우선순위 순)

            // 1. 표준 Downloads 폴더 (대부분 기종에서 작동)
            if (RNFS.DownloadDirectoryPath) {
                paths.push(`${RNFS.DownloadDirectoryPath}/${sanitizedFileName}`);
            }

            // 2. 외부 저장소의 Downloads 폴더 (일부 기종)
            if (RNFS.ExternalStorageDirectoryPath) {
                paths.push(`${RNFS.ExternalStorageDirectoryPath}/Download/${sanitizedFileName}`);
            }

            // 3. 공용 Downloads 폴더 직접 경로 (삼성, LG 등)
            paths.push(`/storage/emulated/0/Download/${sanitizedFileName}`);

            // 4. SD카드 Downloads 폴더 (일부 기종)
            if (RNFS.ExternalStorageDirectoryPath) {
                paths.push(
                    `${RNFS.ExternalStorageDirectoryPath.replace(
                        '/storage/emulated/0',
                        '/storage/sdcard0',
                    )}/Download/${sanitizedFileName}`,
                );
            }

            // 5. 앱별 외부 저장소 Downloads (Scoped Storage 대응)
            if (RNFS.ExternalDirectoryPath) {
                paths.push(`${RNFS.ExternalDirectoryPath}/Download/${sanitizedFileName}`);
            }

            // 6. 앱별 외부 저장소 루트 (최후 수단)
            if (RNFS.ExternalDirectoryPath) {
                paths.push(`${RNFS.ExternalDirectoryPath}/${sanitizedFileName}`);
            }

            // 7. 앱 내부 저장소 (항상 가능, 하지만 다른 앱에서 접근 불가)
            paths.push(`${RNFS.DocumentDirectoryPath}/${sanitizedFileName}`);
        } else {
            // iOS: 사용자가 Files 앱에서 접근 가능한 경로에 저장
            // 1. 공유 Documents 폴더 (Files 앱에서 접근 가능, Info.plist 설정 필요)
            paths.push(`${RNFS.DocumentDirectoryPath}/${sanitizedFileName}`);

            // 2. 임시 폴더 (다운로드 후 Share Sheet로 사용자가 저장 위치 선택)
            paths.push(`${RNFS.TemporaryDirectoryPath}/${sanitizedFileName}`);
        }

        console.log('[FileDownloadService] 시도할 다운로드 경로들:', paths);
        return paths;
    }

    /**
     * 파일이 이미 존재하는지 확인하고 고유한 파일명을 생성합니다
     */
    private static async getUniqueFilePath(filePath: string): Promise<string> {
        let uniquePath = filePath;
        let counter = 1;

        while (await RNFS.exists(uniquePath)) {
            const lastDotIndex = filePath.lastIndexOf('.');
            if (lastDotIndex > 0) {
                const nameWithoutExt = filePath.substring(0, lastDotIndex);
                const extension = filePath.substring(lastDotIndex);
                uniquePath = `${nameWithoutExt}(${counter})${extension}`;
            } else {
                uniquePath = `${filePath}(${counter})`;
            }
            counter++;
        }

        return uniquePath;
    }

    /**
     * 파일 크기를 포맷팅합니다 (Byte -> KB/MB/GB)
     */
    public static formatFileSize(sizeInBytes: number): string {
        if (sizeInBytes < 1024) {
            return `${sizeInBytes} B`;
        }
        const sizeInKB = sizeInBytes / 1024;
        if (sizeInKB < 1024) {
            return `${sizeInKB.toFixed(1)} KB`;
        }
        const sizeInMB = sizeInKB / 1024;
        if (sizeInMB < 1024) {
            return `${sizeInMB.toFixed(1)} MB`;
        }
        const sizeInGB = sizeInMB / 1024;
        return `${sizeInGB.toFixed(1)} GB`;
    }

    /**
     * 파일을 다운로드합니다
     */
    public static async downloadFile(
        fileUrl: string,
        fileName: string,
        fileSize?: number,
    ): Promise<{ success: boolean; filePath?: string; error?: string }> {
        try {
            console.log('[FileDownloadService] 파일 다운로드 시작:', {
                fileUrl,
                fileName,
                fileSize,
                androidVersion: Platform.OS === 'android' ? Platform.Version : 'N/A',
            });

            // 1. 저장소 권한 확인
            const hasPermission = await this.requestStoragePermission();
            if (!hasPermission && Platform.OS === 'android' && Platform.Version < 29) {
                // Android 9 이하에서는 권한이 반드시 필요
                return {
                    success: false,
                    error: '파일 저장 권한이 필요합니다. 설정에서 권한을 허용해주세요.',
                };
            }

            // 2. 다운로드 경로 시도 (여러 경로를 순서대로 시도)
            // 2-a. (Android 12 이하) DownloadManager 경로 우선 시도
            if (Platform.OS === 'android' && (Platform.Version as number) <= 31) {
                try {
                    const title = this.sanitizeFileName(fileName);
                    const mime = this.getMimeType(fileName);
                    // 가능한 한 '진짜' 공용 Downloads 경로를 우선 사용
                    const publicDownloads = RNFS.DownloadDirectoryPath || '/storage/emulated/0/Download';
                    const isPublicDownloads =
                        publicDownloads.includes('/Download') && !publicDownloads.includes('/Android/data/');
                    if (isPublicDownloads) {
                        const dmTargetPath = `${publicDownloads}/${title}`;
                        console.log(
                            '[FileDownloadService] DownloadManager 시도 (API<=31) → 공용 Downloads 경로 지정:',
                            { dmTargetPath, mime },
                        );
                        try {
                            const resExplicit = await RNFetchBlob.config({
                                addAndroidDownloads: {
                                    useDownloadManager: true,
                                    notification: true,
                                    title,
                                    description: '파일 다운로드',
                                    mime,
                                    mediaScannable: true,
                                    path: dmTargetPath,
                                },
                            }).fetch('GET', fileUrl);
                            const savedPath1 = resExplicit.path();
                            console.log(
                                '[FileDownloadService] DownloadManager 저장 완료(공용 Downloads 지정):',
                                savedPath1,
                            );
                            return { success: true, filePath: savedPath1 };
                        } catch (explicitErr) {
                            console.log(
                                '[FileDownloadService] 공용 Downloads 경로 지정 실패, 기본 DownloadManager로 재시도:',
                                explicitErr,
                            );
                            // 아래 기본 처리로 이어짐
                        }
                    } else {
                        console.log(
                            '[FileDownloadService] 공용 Downloads 경로를 판별할 수 없어 기본 DownloadManager로 진행:',
                            publicDownloads,
                        );
                    }

                    // 경로 미지정으로 시스템 기본 처리 (기기 정책/권한에 따라 공용 Downloads에 배치)
                    const resDefault = await RNFetchBlob.config({
                        addAndroidDownloads: {
                            useDownloadManager: true,
                            notification: true,
                            title,
                            description: '파일 다운로드',
                            mime,
                            mediaScannable: true,
                        },
                    }).fetch('GET', fileUrl);
                    const savedPath2 = resDefault.path();
                    console.log('[FileDownloadService] DownloadManager 저장 완료(기본 처리):', savedPath2);
                    return { success: true, filePath: savedPath2 };
                } catch (dmError) {
                    console.log('[FileDownloadService] DownloadManager 실패, RNFS fallback 진행:', dmError);
                    // 계속 RNFS 경로 탐색으로 폴백
                }
            }

            const possiblePaths = await this.getDownloadPaths(fileName);
            let successfulPath: string | null = null;
            let lastError: any = null;

            // 각 경로를 순서대로 시도하여 쓰기 가능한 경로 찾기
            for (const downloadPath of possiblePaths) {
                try {
                    console.log('[FileDownloadService] 경로 시도:', downloadPath);

                    // 디렉토리 생성 시도
                    const dirPath = downloadPath.substring(0, downloadPath.lastIndexOf('/'));
                    await RNFS.mkdir(dirPath);

                    // 쓰기 권한 테스트 (빈 파일 생성 후 삭제)
                    const testFilePath = `${dirPath}/.test_write_${Date.now()}`;
                    await RNFS.writeFile(testFilePath, '');
                    await RNFS.unlink(testFilePath);

                    // 성공하면 고유한 파일명으로 최종 경로 설정
                    successfulPath = await this.getUniqueFilePath(downloadPath);
                    console.log('[FileDownloadService] 사용 가능한 경로 찾음:', successfulPath);
                    break;
                } catch (error) {
                    console.log('[FileDownloadService] 경로 실패:', downloadPath, error);
                    lastError = error;
                    continue;
                }
            }

            if (!successfulPath) {
                console.error('[FileDownloadService] 모든 다운로드 경로 실패:', lastError);
                return {
                    success: false,
                    error: '파일을 저장할 수 있는 경로를 찾을 수 없습니다. 저장소 권한을 확인해주세요.',
                };
            }

            console.log('[FileDownloadService] 최종 다운로드 경로:', successfulPath);

            // 3. 파일 다운로드 실행
            const downloadResult = RNFS.downloadFile({
                fromUrl: fileUrl,
                toFile: successfulPath,
                background: true, // 백그라운드에서 다운로드
                discretionary: true, // iOS에서 시스템이 적절한 시점에 다운로드
            });

            const result = await downloadResult.promise;

            if (result.statusCode === 200) {
                console.log('[FileDownloadService] 파일 다운로드 완료:', successfulPath);
                return {
                    success: true,
                    filePath: successfulPath,
                };
            } else {
                console.error('[FileDownloadService] 다운로드 실패:', result.statusCode);
                return {
                    success: false,
                    error: `다운로드 실패 (HTTP ${result.statusCode})`,
                };
            }
        } catch (error) {
            console.error('[FileDownloadService] 다운로드 오류:', error);

            // 권한 관련 오류인지 확인
            const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
            if (errorMessage.includes('permission') || errorMessage.includes('권한')) {
                return {
                    success: false,
                    error: '파일 저장 권한이 필요합니다. 설정 → 앱 권한에서 저장소 권한을 허용해주세요.',
                };
            }

            return {
                success: false,
                error: errorMessage,
            };
        }
    }
}
