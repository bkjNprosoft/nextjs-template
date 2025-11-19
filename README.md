# Next.js 15 이커머스 쇼핑몰

React 19(App Router) + Prisma + NextAuth.js + shadcn/ui 기반으로 제작된 완전한 이커머스 쇼핑몰입니다. 상품 관리, 장바구니, 주문, 리뷰, 관리자 대시보드 등 모든 기능을 포함합니다.

## 빠른 시작

```bash
# 1. 의존성 설치
pnpm install

# 2. 환경 변수 설정
cp env.example .env
# DATABASE_URL 등 필요한 값 수정

# 3. 데이터베이스 마이그레이션
pnpm db:migrate

# 4. 테스트 데이터 생성 (선택사항)
pnpm create-test-data

# 5. 개발 서버 실행
pnpm dev
```

1. `http://localhost:3000` – 쇼핑몰 홈페이지
2. `http://localhost:3000/sign-in` – 로그인
3. `http://localhost:3000/sign-up` – 회원가입
4. `http://localhost:3000/products` – 상품 목록
5. `http://localhost:3000/admin/dashboard` – 관리자 대시보드 (ADMIN 권한 필요)

## 환경 변수

`env.example`을 참고해 필요한 값을 `.env`에 채워주세요.

| 변수 | 설명 |
| ---- | ---- |
| `DATABASE_URL` | Prisma가 연결할 PostgreSQL URL |
| `NEXTAUTH_SECRET` · `NEXTAUTH_URL` | NextAuth.js 서명/리다이렉션 |
| `GITHUB_ID`, `GITHUB_SECRET` | GitHub OAuth (선택) |
| `RESEND_API_KEY`, `EMAIL_FROM` | Resend 이메일 전송 (선택) |

## 스크립트

| 명령어 | 설명 |
| ------ | ---- |
| `pnpm dev` | Next.js 개발 서버 |
| `pnpm build` | 프로덕션 빌드 |
| `pnpm start` | 프로덕션 서버 실행 |
| `pnpm lint` | ESLint 검사 |
| `pnpm typecheck` | TypeScript 타입 검사 |
| `pnpm db:generate` | Prisma Client 생성 |
| `pnpm db:migrate` | 데이터베이스 마이그레이션 |
| `pnpm db:push` | 스키마를 DB에 강제 반영 |
| `pnpm db:studio` | Prisma Studio GUI |
| `pnpm create-test-data` | 테스트 계정 및 상품 데이터 생성 |
| `pnpm storybook` | Storybook 개발 서버 (`http://localhost:6006`) |
| `pnpm storybook:build` | 정적 Storybook 빌드 |
| `pnpm test` | Vitest 단위 테스트 |
| `pnpm test:e2e` | Playwright E2E 테스트 |

## 주요 기능

### 쇼핑 영역
- **홈페이지**: 인기 상품, 카테고리 목록
- **상품 목록**: 필터, 검색, 정렬 기능
- **상품 상세**: 이미지, 설명, 리뷰, 장바구니 추가
- **카테고리 목록**: 모든 카테고리 브라우징 및 하위 카테고리 표시
- **카테고리별 상품**: 특정 카테고리의 상품 목록 및 필터링
- **검색**: 상품명 및 설명 검색

### 사용자 영역
- **대시보드**: 장바구니 요약, 최근 주문
- **장바구니**: 상품 추가/수정/삭제, 주문하기
- **주문 내역**: 주문 목록 및 상세 정보
- **프로필**: 계정 정보 및 배송지 관리
- **설정**: 테마, 알림 설정

### 관리자 영역
- **대시보드**: 통계, 최근 주문
- **상품 관리**: 상품 등록, 수정, 삭제
- **주문 관리**: 주문 상태 변경, 필터
- **카테고리 관리**: 카테고리 등록, 수정, 삭제
- **리뷰 관리**: 고객 리뷰 확인

## 데이터 모델

### 주요 모델
- **User**: 사용자 (CUSTOMER/ADMIN 역할)
- **Product**: 상품 (이름, 가격, 재고, 이미지 등)
- **Category**: 카테고리 (계층 구조 지원)
- **Cart**: 장바구니
- **CartItem**: 장바구니 항목
- **Order**: 주문
- **OrderItem**: 주문 항목
- **Review**: 리뷰 (평점, 댓글)
- **Address**: 배송지

## 라우트 구조

```
app/
├─ (shop)/                    # 쇼핑 영역
│  ├─ page.tsx               # 홈페이지
│  ├─ products/              # 상품 목록/상세
│  ├─ categories/            # 카테고리 목록
│  ├─ categories/[slug]/     # 카테고리별 상품
│  └─ search/                # 검색 결과
├─ (app)/                     # 사용자 영역
│  ├─ dashboard/             # 대시보드
│  ├─ cart/                  # 장바구니
│  ├─ orders/                # 주문 내역
│  ├─ profile/               # 프로필
│  └─ settings/              # 설정
├─ (admin)/                   # 관리자 영역
│  ├─ dashboard/             # 관리자 대시보드
│  ├─ products/              # 상품 관리
│  ├─ orders/                # 주문 관리
│  ├─ categories/            # 카테고리 관리
│  └─ reviews/               # 리뷰 관리
└─ (auth)/                    # 인증
   ├─ sign-in/               # 로그인
   ├─ sign-up/               # 회원가입
   ├─ forgot-password/       # 비밀번호 찾기
   └─ reset-password/        # 비밀번호 재설정
```

## 기술 스택

- **Next.js 15**: App Router, Server Components, Server Actions
- **React 19**: 최신 React 기능
- **Prisma**: ORM 및 데이터베이스 관리
- **NextAuth.js v5**: 인증 및 세션 관리
- **shadcn/ui**: UI 컴포넌트 라이브러리
- **Tailwind CSS v4**: 스타일링
- **TypeScript**: 타입 안정성
- **Zod**: 스키마 검증
- **Vitest**: 단위 테스트
- **Playwright**: E2E 테스트
- **Storybook**: UI 컴포넌트 문서화

## 테스트 데이터 생성

프로젝트에는 테스트를 위한 계정과 상품을 쉽게 생성할 수 있는 스크립트가 포함되어 있습니다:

```bash
pnpm create-test-data
```

이 명령어는 다음을 생성합니다:

**계정:**
- 관리자 계정: `admin@test.com` / `password123` (ADMIN 권한)
- 일반 유저 계정: `user@test.com` / `password123` (CUSTOMER 권한)

**카테고리:**
- 의류 (패션 의류 카테고리)
- 전자제품 (전자제품 및 가전 카테고리)
- 도서 (도서 및 출판물 카테고리)

**상품:**
- 청바지 (89,000원, 재고 100개) - 인기 상품
- 면 티셔츠 (29,000원, 재고 150개)
- 무선 이어폰 (159,000원, 재고 50개) - 인기 상품
- 스마트폰 케이스 (19,000원, 재고 200개)
- 프로그래밍 입문서 (25,000원, 재고 80개)

### 수동으로 관리자 계정 생성하기

테스트 스크립트를 사용하지 않는 경우:

1. 일반 회원가입으로 계정 생성
2. Prisma Studio 실행: `pnpm db:studio`
3. User 테이블에서 해당 사용자의 `role`을 `ADMIN`으로 변경
4. 또는 데이터베이스에서 직접 수정:
   ```sql
   UPDATE "User" SET role = 'ADMIN' WHERE email = 'your-email@example.com';
   ```

## 배송비 정책

- 50,000원 이상 구매 시 무료배송
- 미만 시 3,000원 배송비

## 주문 상태

- **PENDING**: 대기 중
- **CONFIRMED**: 확인됨
- **PROCESSING**: 처리 중
- **SHIPPED**: 배송 중
- **DELIVERED**: 배송 완료
- **CANCELLED**: 취소됨
- **REFUNDED**: 환불됨

## 개발 가이드

### 서버 액션
서버 액션은 `src/server/actions/` 디렉토리에 위치하며, 폼 제출 및 데이터 변경을 처리합니다.

### 데이터 페칭
데이터 페칭 함수는 `src/server/data/` 디렉토리에 위치하며, `cache()`를 사용하여 중복 요청을 방지합니다.

### 컴포넌트 구조
- `src/components/products/`: 상품 관련 컴포넌트
- `src/components/cart/`: 장바구니 관련 컴포넌트
- `src/components/orders/`: 주문 관련 컴포넌트
- `src/components/reviews/`: 리뷰 관련 컴포넌트
- `src/components/admin/`: 관리자 관련 컴포넌트
- `src/components/ui/`: shadcn/ui 기본 컴포넌트

## 품질 & 확장 아이디어

- **테스트/CI**: Vitest 단위 테스트, Playwright E2E 테스트, Storybook 문서화
- **결제**: Stripe, Toss Payments 등 결제 게이트웨이 연동
- **이미지 업로드**: UploadThing, Cloudinary 등 이미지 호스팅 서비스 연동
- **검색**: Algolia, Elasticsearch 등 전문 검색 엔진 연동
- **관측/로깅**: Sentry, PostHog 등 모니터링 도구 연동
- **보안**: CSP/HSTS 설정, rate limiting, CSRF 보호 강화

## 라이선스

MIT
