-- AlterTable
ALTER TABLE "User" ADD COLUMN     "verifyCode" TEXT,
ADD COLUMN     "verifyCodeExpiry" TIMESTAMP(3);
