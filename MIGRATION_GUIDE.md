# FSD 아키텍처 마이그레이션 가이드

## ✅ 완료된 작업

### 1. Shared 레이어 생성 완료

- ✅ `src/shared/ui/atoms/` - 기본 컴포넌트 (Button, Input, Label, Badge, Avatar, Skeleton, Separator, Switch, Textarea, Checkbox, RadioGroup)
- ✅ `src/shared/ui/molecules/` - 복합 컴포넌트 (Dialog, Form, Select, DropdownMenu, Popover, Tooltip, Sheet, Card)
- ✅ `src/shared/lib/` - 유틸리티 함수 (utils, auth, prisma, mailer, password, password-reset, slugify)
- ✅ `src/shared/providers/` - 공유 Provider 컴포넌트 (app-providers, auth-provider, query-provider)

### 2. Entities 레이어 생성 완료

- ✅ `src/entities/product/` - 상품 도메인 (ui, api)
- ✅ `src/entities/order/` - 주문 도메인 (ui, api)
- ✅ `src/entities/cart/` - 장바구니 도메인 (api)
- ✅ `src/entities/category/` - 카테고리 도메인 (ui, api)
- ✅ `src/entities/address/` - 주소 도메인 (ui, api)
- ✅ `src/entities/review/` - 리뷰 도메인 (ui, api)
- ✅ `src/entities/user/` - 사용자 도메인 (api - preferences)

### 3. Features 레이어 생성 완료

- ✅ `src/features/add-to-cart/` - 장바구니 추가 기능
- ✅ `src/features/checkout/` - 결제 기능
- ✅ `src/features/create-address/` - 주소 생성 기능
- ✅ `src/features/settings/` - 설정 기능

### 4. Widgets 레이어 생성 완료

- ✅ `src/widgets/product-list/` - 상품 목록 위젯
- ✅ `src/widgets/cart-summary/` - 장바구니 요약 위젯
- ✅ `src/widgets/sidebar/` - 사이드바 위젯
- ✅ `src/widgets/admin-sidebar/` - 관리자 사이드바 위젯
- ✅ `src/widgets/navigation/main-nav/` - 메인 네비게이션 위젯

### 5. 경로 별칭 업데이트 완료

- ✅ `tsconfig.json` - FSD 레이어별 경로 별칭 추가
- ✅ `components.json` - aliases 업데이트

### 6. Import 경로 수정 완료

- ✅ 모든 파일의 import 경로를 새로운 FSD 구조에 맞게 수정
- ✅ Storybook 파일들의 import 경로 수정

## 📋 현재 상태

### 파일 구조

```
src/
├── app/                    # Next.js App Router (변경 없음)
├── widgets/               # 복합 UI 블록 ✅
│   ├── product-list/
│   ├── cart-summary/
│   ├── sidebar/
│   ├── admin-sidebar/
│   └── navigation/
├── features/              # 비즈니스 기능 ✅
│   ├── add-to-cart/
│   ├── checkout/
│   ├── create-address/
│   └── settings/
├── entities/              # 도메인 엔티티 ✅
│   ├── product/
│   │   ├── ui/
│   │   └── api/
│   ├── order/
│   │   ├── ui/
│   │   └── api/
│   ├── cart/
│   │   └── api/
│   ├── category/
│   │   ├── ui/
│   │   └── api/
│   ├── address/
│   │   ├── ui/
│   │   └── api/
│   ├── review/
│   │   ├── ui/
│   │   └── api/
│   └── user/
│       └── api/
└── shared/                # 공통 코드 ✅
    ├── ui/                # Atomic Design
    │   ├── atoms/
    │   └── molecules/
    ├── lib/
    └── providers/
```

### Import 경로 매핑

- `@/components/ui/*` → `@/shared/ui/atoms/*` 또는 `@/shared/ui/molecules/*`
- `@/lib/*` → `@/shared/lib/*`
- `@/components/providers/*` → `@/shared/providers/*`
- `@/server/actions/*` → `@/entities/{domain}/api/actions` 또는 `@/features/{feature}/api`
- `@/server/data/*` → `@/entities/{domain}/api/data`
- `@/components/products/*` → `@/entities/product/ui/*`
- `@/components/cart/*` → `@/widgets/cart-summary/` 또는 `@/features/add-to-cart/`
- `@/components/orders/*` → `@/features/checkout/` 또는 `@/entities/order/ui/*`
- `@/components/addresses/*` → `@/entities/address/ui/*` 또는 `@/features/create-address/`
- `@/components/reviews/*` → `@/entities/review/ui/*`
- `@/components/admin/*` → 해당 엔티티의 `ui/` 또는 `features/`
- `@/server/actions/notifications` → `@/entities/user/api/actions`
- `@/server/data/notifications` → `@/entities/user/api/data`

## 🧹 정리 작업 (선택사항)

### 기존 폴더 정리

다음 폴더들은 이미 새로운 위치로 이동되었지만, 원본 파일들이 남아있을 수 있습니다:

- `src/components/` - 대부분의 파일이 새로운 위치로 이동됨
- `src/lib/` - `src/shared/lib/`로 이동됨
- `src/server/actions/` - 각 엔티티의 `api/actions.ts`로 이동됨
- `src/server/data/` - 각 엔티티의 `api/data.ts`로 이동됨

**주의**: 기존 폴더를 삭제하기 전에 모든 import 경로가 올바르게 수정되었는지 확인하세요.

## ✅ 검증 체크리스트

- [x] Shared 레이어 구성 완료
- [x] Entities 레이어 구성 완료
- [x] Features 레이어 구성 완료
- [x] Widgets 레이어 구성 완료
- [x] Import 경로 수정 완료
- [x] Path aliases 업데이트 완료
- [ ] 빌드 테스트: `pnpm build`
- [ ] 타입 체크: `pnpm typecheck`
- [ ] 린트 확인: `pnpm lint`
- [ ] 애플리케이션 실행 테스트

## 🚀 다음 단계

1. 빌드 및 테스트 실행
2. 기존 폴더 정리 (선택사항)
3. 문서화 업데이트
4. 팀원들에게 새로운 구조 공유

## 📚 참고 자료

- [Feature-Sliced Design 공식 문서](https://feature-sliced.design/)
- [Atomic Design 패턴](https://atomicdesign.bradfrost.com/)
- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)
