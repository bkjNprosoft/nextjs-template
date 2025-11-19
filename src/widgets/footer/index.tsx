import Link from "next/link";
import {
  Facebook,
  Instagram,
  Twitter,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* 회사 정보 */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-primary">쇼핑몰</h3>
            <p className="text-sm text-muted-foreground">
              최고의 쇼핑 경험을 제공하는 이커머스 플랫폼입니다.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="text-muted-foreground transition-colors hover:text-primary"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-muted-foreground transition-colors hover:text-primary"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-muted-foreground transition-colors hover:text-primary"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* 고객 지원 */}
          <div className="space-y-4">
            <h4 className="font-semibold">고객 지원</h4>
            <nav className="space-y-2">
              <Link
                href="/products"
                className="block text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                상품 둘러보기
              </Link>
              <Link
                href="/orders"
                className="block text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                주문 조회
              </Link>
              <Link
                href="/profile"
                className="block text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                마이페이지
              </Link>
            </nav>
          </div>

          {/* 연락처 */}
          <div className="space-y-4">
            <h4 className="font-semibold">연락처</h4>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <Phone className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>1588-0000</span>
              </div>
              <div className="flex items-start gap-2">
                <Mail className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>support@shoppingmall.com</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>서울특별시 강남구 테헤란로 123</span>
              </div>
            </div>
          </div>
        </div>

        {/* 하단 저작권 */}
        <div className="mt-12 border-t pt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-muted-foreground">
              © 2024 쇼핑몰. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link
                href="#"
                className="transition-colors hover:text-primary"
              >
                이용약관
              </Link>
              <Link
                href="#"
                className="transition-colors hover:text-primary"
              >
                개인정보처리방침
              </Link>
              <Link
                href="#"
                className="transition-colors hover:text-primary"
              >
                사업자정보
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

