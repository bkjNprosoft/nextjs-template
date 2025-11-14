# 초기 기능 구현 계획

## 개요

NextAuth 인증 흐름, 개인화 대시보드, 협업형 리소스/알림 기능을 추가하여 실무형 스타터 템플릿으로 확장합니다.

## 작업 단계

1. 인증/권한 설정 강화  
   - `src/lib/auth.ts`, `src/app/api/auth/[...nextauth]/route.ts`에서 이메일·소셜 로그인 플로우와 RBAC 역할(`ADMIN`, `MEMBER`) 구현  
   - 가입/로그인/비밀번호 재설정 UI: `src/app/(auth)/signup/page.tsx`, `src/app/(auth)/login/page.tsx`
2. 대시보드 구성 요소 제작  
   - 사용자별 카드 위젯, 최근 활동 리스트, 차트 컴포넌트 추가: `src/app/(dashboard)/page.tsx`, `src/components/dashboard/*`  
   - 차트 데이터 예시용 API: `src/app/api/dashboard/route.ts`
3. 리소스 관리 및 협업 흐름  
   - 게시글/프로젝트 CRUD 페이지와 Prisma 모델 확장: `prisma/schema.prisma`, `src/app/(dashboard)/projects/*`  
   - 댓글/태그 기능과 검색 API: `src/app/api/projects/*`
4. 알림 및 설정 페이지  
   - Resend 연동 이메일 알림 + 앱 내 알림센터: `src/lib/notifications.ts`, `src/app/(dashboard)/notifications/page.tsx`  
   - 사용자 환경설정(프로필, 테마, 알림 토글): `src/app/(dashboard)/settings/page.tsx`
5. 품질 확보  
   - Vitest/Playwright 테스트 추가: `tests/unit/auth.test.ts`, `tests/e2e/dashboard.spec.ts`  
   - Storybook 문서화: `src/stories/DashboardCard.stories.tsx`

## TODO

- [ ] 인증 및 RBAC 구축
- [ ] 대시보드 UI/데이터 구현
- [ ] 프로젝트 CRUD와 협업 기능
- [ ] 알림·설정 페이지 제작
- [ ] 테스트·스토리북 정비
