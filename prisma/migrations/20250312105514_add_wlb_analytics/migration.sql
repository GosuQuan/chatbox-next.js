/*
  Warnings:

  - You are about to drop the column `verifyCode` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `verifyCodeExpiry` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "User_verifyCode_idx";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "verifyCode",
DROP COLUMN "verifyCodeExpiry";

-- CreateTable
CREATE TABLE "TempUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "verifyCode" TEXT NOT NULL,
    "verifyCodeExpiry" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TempUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WlbAnalytics" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "formCompletion" INTEGER NOT NULL,
    "score" DOUBLE PRECISION,
    "age" INTEGER,
    "education" TEXT,
    "salary" DOUBLE PRECISION,
    "workHours" DOUBLE PRECISION,
    "vacation" INTEGER,
    "commuteTime" INTEGER,
    "city" TEXT,
    "benefits" DOUBLE PRECISION,
    "colleaguesAppearance" INTEGER,
    "colleaguesCompetence" INTEGER,
    "colleaguesEducation" TEXT,
    "companySize" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WlbAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TempUser_email_key" ON "TempUser"("email");

-- CreateIndex
CREATE INDEX "TempUser_verifyCode_idx" ON "TempUser"("verifyCode");

-- CreateIndex
CREATE INDEX "WlbAnalytics_sessionId_idx" ON "WlbAnalytics"("sessionId");

-- CreateIndex
CREATE INDEX "WlbAnalytics_timestamp_idx" ON "WlbAnalytics"("timestamp");

-- CreateIndex
CREATE INDEX "WlbAnalytics_city_idx" ON "WlbAnalytics"("city");
