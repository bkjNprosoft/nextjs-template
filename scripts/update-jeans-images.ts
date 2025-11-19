/* eslint-disable no-console */
import { prisma } from "../src/shared/lib/prisma";

async function updateJeansImages() {
  console.log("👖 청바지 상품 이미지 업데이트 중...");

  // 청바지 상품 찾기
  const jeansProduct = await prisma.product.findFirst({
    where: {
      name: {
        contains: "청바지",
      },
    },
  });

  if (!jeansProduct) {
    console.log("❌ 청바지 상품을 찾을 수 없습니다.");
    return;
  }

  console.log(`✅ 청바지 상품 발견: ${jeansProduct.name} (ID: ${jeansProduct.id})`);
  console.log(`   현재 이미지: ${jeansProduct.images.join(", ")}`);

  // 유효한 청바지 이미지 URL로 교체
  const newImages = [
    "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&h=800&fit=crop",
    "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&h=800&fit=crop",
    "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&h=800&fit=crop",
  ];

  const updatedProduct = await prisma.product.update({
    where: {
      id: jeansProduct.id,
    },
    data: {
      images: newImages,
    },
  });

  console.log(`✅ 이미지 업데이트 완료!`);
  console.log(`   새로운 이미지: ${updatedProduct.images.join(", ")}`);
}

async function main() {
  try {
    await updateJeansImages();
  } catch (error) {
    console.error("❌ 오류 발생:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

void main();

