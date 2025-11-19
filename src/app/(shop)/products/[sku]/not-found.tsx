import Link from "next/link";
import { Button } from "@/shared/ui/atoms/button";

export default function NotFound() {
  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center space-y-4 text-center">
      <h1 className="text-4xl font-bold">상품을 찾을 수 없습니다</h1>
      <p className="text-muted-foreground">
        요청하신 상품이 존재하지 않거나 삭제되었습니다.
      </p>
      <div className="flex gap-4">
        <Button asChild>
          <Link href="/products">상품 목록으로</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">홈으로</Link>
        </Button>
      </div>
    </div>
  );
}

