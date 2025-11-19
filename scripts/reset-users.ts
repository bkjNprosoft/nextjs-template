/* eslint-disable no-console */
import { UserRole } from "@prisma/client";
import { prisma } from "../src/shared/lib/prisma";
import { hashPassword } from "../src/shared/lib/password";

async function resetUsers() {
  console.log("🗑️  User 테이블 데이터 삭제 중...");

  // User 테이블의 모든 데이터 삭제
  // 관련된 외래키 제약조건 때문에 순서가 중요합니다
  await prisma.wishlistItem.deleteMany({});
  await prisma.passwordResetToken.deleteMany({});
  await prisma.userPreference.deleteMany({});
  await prisma.address.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.cart.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.account.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("✅ User 테이블 데이터 삭제 완료");
  console.log("");

  console.log("📝 새 계정 생성 중...");

  // 관리자 계정 생성
  const adminPassword = "1234";
  const adminPasswordHash = await hashPassword(adminPassword);
  const admin = await prisma.user.create({
    data: {
      email: "admin@example.com",
      name: "관리자",
      passwordHash: adminPasswordHash,
      role: UserRole.ADMIN,
    },
  });
  console.log(`✅ 관리자 계정 생성 완료`);
  console.log(`   이메일: ${admin.email}`);
  console.log(`   비밀번호: ${adminPassword}`);
  console.log(`   역할: ${admin.role}`);
  console.log(`   계정 ID: ${admin.id}`);
  console.log("");

  // 사용자 계정 생성
  const userPassword = "1234";
  const userPasswordHash = await hashPassword(userPassword);
  const user = await prisma.user.create({
    data: {
      email: "user@example.com",
      name: "사용자",
      passwordHash: userPasswordHash,
      role: UserRole.CUSTOMER,
    },
  });
  console.log(`✅ 사용자 계정 생성 완료`);
  console.log(`   이메일: ${user.email}`);
  console.log(`   비밀번호: ${userPassword}`);
  console.log(`   역할: ${user.role}`);
  console.log(`   계정 ID: ${user.id}`);
  console.log("");

  console.log("✨ 작업 완료!");
}

resetUsers()
  .catch((error) => {
    console.error("❌ 오류 발생:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

