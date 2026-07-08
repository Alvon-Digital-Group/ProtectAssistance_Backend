-- AlterTable
ALTER TABLE "Evidence" ADD COLUMN     "storageKey" TEXT,
ADD COLUMN     "storageProvider" TEXT NOT NULL DEFAULT 'local';
