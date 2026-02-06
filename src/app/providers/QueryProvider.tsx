import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

interface QueryProviderProps {
  children: React.ReactNode;
}

// TanStack Query Client 생성 및 설정
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5
      gcTime: 5 * 60 * 1000, // 5분
      retry: (failureCount, error: any) => {
        // 4xx 에러 (클라이언트 오류)는 재시도하지 않음
        if (error?.skipRetry || (error?.status >= 400 && error?.status < 500)) {
          return false;
        }
        return failureCount < 2;
      },
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

export const QueryProvider = ({ children }: QueryProviderProps) => {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};
