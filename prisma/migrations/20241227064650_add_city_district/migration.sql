/*
  Warnings:

  - A unique constraint covering the columns `[kakaoId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `city` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `district` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "city" TEXT NOT NULL,
ADD COLUMN     "district" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "kakaoId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_kakaoId_key" ON "User"("kakaoId");
