# Next.js 15 SaaS Starter

React 19(App Router) + Prisma + NextAuth.js + shadcn/ui 기반으로 제작된 프로덕션 지향 템플릿입니다. 라우트 그룹, Server Action, React Query, Tailwind CSS v4를 기본 제공하며 대시보드/워크스페이스 예제를 포함합니다.

## 빠른 시작

```bash
pnpm install
cp env.example .env

# DATABASE_URL 수정 후 생성
pnpm db:migrate

pnpm dev
```

1. `http://localhost:3000` – 마케팅 랜딩
2. `http://localhost:3000/sign-in` – GitHub OAuth 또는 Resend Magic Link(환경 변수 필요)로 로그인
3. `http://localhost:3000/dashboard` – 워크스페이스 생성/목록
4. `http://localhost:3000/workspaces/[slug]` – 워크스페이스 상세 (권한 체크 포함)

## 환경 변수

`env.example`을 참고해 필요한 값을 `.env`에 채워주세요.

| 변수 | 설명 |
| ---- | ---- |
| `DATABASE_URL` | Prisma가 연결할 PostgreSQL URL |
| `NEXTAUTH_SECRET` · `NEXTAUTH_URL` | NextAuth.js 서명/리다이렉션 |
| `GITHUB_ID`, `GITHUB_SECRET` | GitHub OAuth (선택) |
| `RESEND_API_KEY`, `EMAIL_FROM` | Resend Magic Link 로그인 (선택) |

## 스크립트

| 명령어 | 설명 |
| ------ | ---- |
| `pnpm dev` | Next.js 개발 서버 |
| `pnpm lint` | ESLint (Flat config + Next.js + React Hooks) |
| `pnpm typecheck` | TypeScript `--noEmit` 검사 |
| `pnpm db:generate` | Prisma Client 생성 |
| `pnpm db:migrate` | `prisma migrate dev` – 개발 DB 마이그레이션 |
| `pnpm db:push` | 스키마를 DB에 강제 반영 |
| `pnpm db:studio` | Prisma Studio GUI |
| `pnpm storybook` | Storybook 8 개발 서버 (`http://localhost:6006`) |
| `pnpm storybook:build` | 정적 Storybook 빌드(`storybook-static/`) |

## 라우트 구조

```
app/
├─ (marketing)/page.tsx     # 랜딩 페이지
├─ (auth)/sign-in/page.tsx  # 인증 진입점
├─ (app)/layout.tsx         # 인증된 사용자 레이아웃
│  ├─ dashboard/page.tsx    # 워크스페이스 생성/목록
│  └─ workspaces/[slug]/page.tsx
└─ api/auth/[...nextauth]/route.ts # NextAuth 핸들러
```

- 공유 Provider(`AppProviders`)에서 NextAuth Session과 React Query Client를 초기화합니다.
- `(app)` 레이아웃은 `auth()` 호출로 세션을 확인 후, 미로그인의 경우 `/sign-in` 으로 리다이렉션합니다.

## 데이터 / 인증 레이어

- **Prisma**: `prisma/schema.prisma` 에서 `User`, `Workspace`, `WorkspaceMember` 모델과 `UserRole`, `WorkspaceRole` 열거형을 정의했습니다.
- **서버 액션**: `src/server/actions/workspaces.ts`에서 Zod 검증 + Server Action으로 워크스페이스 생성, `revalidatePath`로 캐시 무효화.
- **데이터 서비스**: `src/server/data/workspaces.ts` 에서 `cache()`와 Prisma를 조합해 세션에 따른 데이터 fetch를 제공합니다.
- **NextAuth.js v5**: GitHub OAuth 및 Resend 이메일 Magic Link를 지원하며 `Session` 타입 확장을 통해 `user.id`, `user.role`을 노출합니다.
- **React Query**: `QueryProvider`에서 기본 `staleTime`과 Devtools를 설정합니다. 클라이언트 폼(`CreateWorkspaceForm`)은 `useActionState`와 함께 optimistic UX를 제공합니다.

## UI / 스타일

- Tailwind CSS v4 + PostCSS + Autoprefixer. 색상/타이포 변수는 `src/app/globals.css`에서 정의합니다.
- `pnpm dlx shadcn@latest` 로 생성된 컴포넌트는 `src/components/ui`에 보관하며, 상태 폼과 UX 컴포넌트는 `src/components/forms`, `src/components/providers`에 위치합니다.
- 대시보드와 워크스페이스 상세에서 shadcn/ui Card, Badge, Tooltip 등을 활용한 레이아웃 샘플을 제공합니다.

## Storybook

- **Storybook 8.6.14** (`@storybook/experimental-nextjs-vite`) 설정이 `.storybook/`에 구성되어 있습니다.
- Next.js 15 + App Router와 완벽 호환되며, Vite 기반으로 빠른 HMR과 개발 경험을 제공합니다.
- `@` 경로 별칭, 전역 CSS(`src/app/globals.css`) 자동 적용, Tailwind CSS v4 지원.
- 샘플 스토리: `src/stories/button.stories.tsx`, `src/stories/card.stories.tsx`, `src/stories/metric-card.stories.tsx`, `src/stories/activity-list.stories.tsx`.
- UI 컴포넌트와 대시보드 컴포넌트의 다양한 상태와 변형을 시각적으로 확인하고 문서화할 수 있습니다.
- 실행: `pnpm storybook` (`http://localhost:6006`), 정적 빌드: `pnpm storybook:build`.

## 품질 & 확장 아이디어

- **테스트/CI**: Vitest 2.1.9 단위 테스트(`pnpm test`), Playwright 스모크 시나리오(`pnpm test:e2e`), Storybook 8 인터랙티브 문서로 구성되어 있습니다. CI에서는 `pnpm lint && pnpm typecheck && pnpm test && pnpm test:e2e && pnpm storybook:build` 조합을 권장합니다.
- **관측/로깅**: Sentry, PostHog, OpenTelemetry 연결과 README 업데이트는 `observability-docs` 작업에서 진행합니다.
- **도메인 확장**: 결제(Stripe Billing), 스토리지(UploadThing), 에디터(Tiptap) 등은 Prisma 모델과 Route Handler를 확장하여 통합할 수 있습니다.
- **보안**: `next-safe-middleware`로 CSP/HSTS 설정, `middleware.ts`로 접근 제어, 서버 액션에서 권한 체크를 강화해주세요.

## 참고

- [Next.js 15 App Router](https://nextjs.org/docs/app)
- [Auth.js (NextAuth.js v5)](https://authjs.dev/)
- [Prisma ORM](https://www.prisma.io/docs)
- [shadcn/ui](https://ui.shadcn.com)
