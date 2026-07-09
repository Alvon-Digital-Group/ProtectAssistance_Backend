/*
  Warnings:

  - You are about to drop the column `recipientId` on the `Notification` table. All the data in the column will be lost.
  - Added the required column `body` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_recipientId_fkey";

-- DropIndex
DROP INDEX "Notification_recipientId_idx";

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "recipientId",
ADD COLUMN     "body" TEXT NOT NULL,
ADD COLUMN     "errorMessage" TEXT,
ADD COLUMN     "payload" JSONB,
ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userId" UUID NOT NULL,
ALTER COLUMN "alertId" DROP NOT NULL,
ALTER COLUMN "channel" SET DEFAULT 'PUSH';

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
