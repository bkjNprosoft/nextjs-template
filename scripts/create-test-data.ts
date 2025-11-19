/* eslint-disable no-console */
import { UserRole } from "@prisma/client";
import { prisma } from "../src/shared/lib/prisma";
import { hashPassword } from "../src/shared/lib/password";
import { slugify } from "../src/shared/lib/slugify";

async function createTestUsers() {
  console.log("📝 테스트 계정 생성 중...");

  // 관리자 계정 생성
  const adminEmail = "admin@test.com";
  const adminPassword = "password123";

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log(`✅ 관리자 계정이 이미 존재합니다: ${adminEmail}`);
  } else {
    const adminPasswordHash = await hashPassword(adminPassword);
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        name: "관리자",
        passwordHash: adminPasswordHash,
        role: UserRole.ADMIN,
      },
    });
    console.log(`✅ 관리자 계정 생성 완료: ${adminEmail} / ${adminPassword}`);
    console.log(`   계정 ID: ${admin.id}`);
  }

  // 일반 유저 계정 생성
  const userEmail = "user@test.com";
  const userPassword = "password123";

  const existingUser = await prisma.user.findUnique({
    where: { email: userEmail },
  });

  if (existingUser) {
    console.log(`✅ 일반 유저 계정이 이미 존재합니다: ${userEmail}`);
  } else {
    const userPasswordHash = await hashPassword(userPassword);
    const user = await prisma.user.create({
      data: {
        email: userEmail,
        name: "일반 유저",
        passwordHash: userPasswordHash,
        role: UserRole.CUSTOMER,
      },
    });
    console.log(`✅ 일반 유저 계정 생성 완료: ${userEmail} / ${userPassword}`);
    console.log(`   계정 ID: ${user.id}`);
  }
}

async function findOrCreateCategory(name: string, description?: string) {
  const slug = slugify(name);

  let category = await prisma.category.findUnique({
    where: { slug },
  });

  if (!category) {
    category = await prisma.category.create({
      data: {
        name,
        slug,
        description,
      },
    });
    console.log(`✅ 카테고리 생성 완료: ${name}`);
  } else {
    console.log(`✅ 카테고리 이미 존재: ${name}`);
  }

  return category;
}

async function createProduct(
  name: string,
  description: string,
  price: string,
  stock: number,
  categoryId: string,
  images: string[],
  featured = false,
) {
  const baseSlug = slugify(name) || "product";
  const existingCount = await prisma.product.count({
    where: { slug: { startsWith: baseSlug } },
  });
  const slug =
    existingCount > 0 ? `${baseSlug}-${existingCount + 1}` : baseSlug;

  const existingProduct = await prisma.product.findFirst({
    where: {
      name: {
        contains: name,
      },
      categoryId,
    },
  });

  if (existingProduct) {
    console.log(`✅ 상품이 이미 존재합니다: ${existingProduct.name}`);
    return existingProduct;
  }

  const product = await prisma.product.create({
    data: {
      name,
      slug,
      description,
      price,
      stock,
      sku: `${name.toUpperCase().replace(/\s/g, "-")}-${Date.now()}`,
      categoryId,
      featured,
      active: true,
      images,
    },
  });

  console.log(`✅ 상품 생성 완료: ${product.name} (${Number(product.price)}원)`);
  return product;
}

async function createTestProducts() {
  console.log("🛍️ 테스트 상품 생성 중...");

  // 카테고리 생성
  const clothingCategory = await findOrCreateCategory(
    "의류",
    "패션 의류 카테고리",
  );
  const electronicsCategory = await findOrCreateCategory(
    "전자제품",
    "전자제품 및 가전 카테고리",
  );
  const booksCategory = await findOrCreateCategory(
    "도서",
    "도서 및 출판물 카테고리",
  );

  // 의류 상품들
  await createProduct(
    "청바지",
    "편안하고 스타일리시한 청바지입니다. 다양한 사이즈로 제공됩니다.",
    "89000",
    100,
    clothingCategory.id,
    [
      "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&h=800&fit=crop",
    ],
    true,
  );

  await createProduct(
    "면 티셔츠",
    "부드럽고 편안한 면 소재의 기본 티셔츠입니다.",
    "29000",
    150,
    clothingCategory.id,
    [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop",
    ],
    false,
  );

  // 전자제품
  await createProduct(
    "무선 이어폰",
    "고음질 무선 이어폰입니다. 노이즈 캔슬링 기능을 지원합니다.",
    "159000",
    50,
    electronicsCategory.id,
    [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop",
    ],
    true,
  );

  await createProduct(
    "스마트폰 케이스",
    "강화 유리 소재의 스마트폰 보호 케이스입니다.",
    "19000",
    200,
    electronicsCategory.id,
    [
      "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800&h=800&fit=crop",
    ],
    false,
  );

  // 도서
  await createProduct(
    "프로그래밍 입문서",
    "초보자를 위한 프로그래밍 입문서입니다. 실습 예제가 풍부합니다.",
    "25000",
    80,
    booksCategory.id,
    [
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&h=800&fit=crop",
    ],
    false,
  );

  console.log("✅ 모든 테스트 상품 생성 완료");
}

async function main() {
  try {
    console.log("🚀 테스트 데이터 생성 시작...\n");

    // 계정 생성
    await createTestUsers();
    console.log("");

    // 테스트 상품 생성
    await createTestProducts();
    console.log("");

    console.log("✅ 모든 테스트 데이터 생성이 완료되었습니다!");
    console.log("\n📋 생성된 계정 정보:");
    console.log("   관리자: admin@test.com / password123");
    console.log("   일반 유저: user@test.com / password123");
    console.log("\n📦 생성된 카테고리:");
    console.log("   - 의류");
    console.log("   - 전자제품");
    console.log("   - 도서");
    console.log("\n🛍️ 생성된 상품:");
    console.log("   - 청바지 (89,000원) - 인기 상품");
    console.log("   - 면 티셔츠 (29,000원)");
    console.log("   - 무선 이어폰 (159,000원) - 인기 상품");
    console.log("   - 스마트폰 케이스 (19,000원)");
    console.log("   - 프로그래밍 입문서 (25,000원)");
  } catch (error) {
    console.error("❌ 오류 발생:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

void main();
