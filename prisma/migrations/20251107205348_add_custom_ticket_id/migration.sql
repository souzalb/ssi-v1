/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `areas` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[ticketId]` on the table `tickets` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `areas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ticketId` to the `tickets` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "areas" ADD COLUMN     "code" TEXT NOT NULL,
ADD COLUMN     "ticketCounter" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "tickets" ADD COLUMN     "resolvedAt" TIMESTAMP(3),
ADD COLUMN     "satisfactionRating" INTEGER,
ADD COLUMN     "slaDeadline" TIMESTAMP(3),
ADD COLUMN     "ticketId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "attachments" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "fileType" TEXT,
    "size" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ticketId" TEXT NOT NULL,
    "uploaderId" TEXT NOT NULL,

    CONSTRAINT "attachments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "attachments_ticketId_idx" ON "attachments"("ticketId");

-- CreateIndex
CREATE INDEX "attachments_uploaderId_idx" ON "attachments"("uploaderId");

-- CreateIndex
CREATE UNIQUE INDEX "areas_code_key" ON "areas"("code");

-- CreateIndex
CREATE UNIQUE INDEX "tickets_ticketId_key" ON "tickets"("ticketId");

-- CreateIndex
CREATE INDEX "tickets_ticketId_idx" ON "tickets"("ticketId");
