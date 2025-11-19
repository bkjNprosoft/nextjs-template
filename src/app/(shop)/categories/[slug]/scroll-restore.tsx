"use client";

import { useLayoutEffect, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";

type ScrollRestoreProps = {
  pathname: string;
};

export function ScrollRestore({ pathname }: ScrollRestoreProps) {
  const searchParams = useSearchParams();
  const scrollKey = `scroll-${pathname}`;
  const lastSearchParamsRef = useRef<string>("");

  // 브라우저의 기본 스크롤 복원 비활성화 (최초 한 번만)
  useLayoutEffect(() => {
    if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  // searchParams 변경 시마다 스크롤 복원
  const searchParamsString = searchParams.toString();
  useLayoutEffect(() => {
    const currentSearchParams = searchParamsString;
    
    // searchParams가 변경되었을 때만 스크롤 복원
    if (currentSearchParams !== lastSearchParamsRef.current) {
      lastSearchParamsRef.current = currentSearchParams;
      
      const savedScrollPosition = sessionStorage.getItem(scrollKey);
      if (savedScrollPosition) {
        const scrollY = Number(savedScrollPosition);
        
        // 스크롤 동작을 즉시로 설정하여 애니메이션 없이 이동
        const html = document.documentElement;
        const body = document.body;
        const originalScrollBehavior = html.style.scrollBehavior;
        
        html.style.scrollBehavior = "auto";
        
        // 즉시 스크롤 설정 (여러 방법으로 시도)
        html.scrollTop = scrollY;
        body.scrollTop = scrollY;
        window.scrollTo(0, scrollY);
        
        // 추가로 한 번 더 확인하여 확실히 설정
        requestAnimationFrame(() => {
          if (window.scrollY !== scrollY) {
            html.scrollTop = scrollY;
            body.scrollTop = scrollY;
            window.scrollTo(0, scrollY);
          }
          html.style.scrollBehavior = originalScrollBehavior;
        });
        
        sessionStorage.removeItem(scrollKey);
      }
    }
  }, [scrollKey, searchParamsString]);

  // 스크롤 이벤트로 현재 위치 추적
  useEffect(() => {
    const handleScroll = () => {
      sessionStorage.setItem(scrollKey, String(window.scrollY));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrollKey]);

  return null;
}

