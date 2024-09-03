/*
  Warnings:

  - You are about to drop the column `refereshToken` on the `RefreshToken` table. All the data in the column will be lost.
  - Added the required column `refreshToken` to the `RefreshToken` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RefreshToken" DROP COLUMN "refereshToken",
ADD COLUMN     "refreshToken" TEXT NOT NULL;
