-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_teamId_fkey";

-- AlterTable
ALTER TABLE "Session" ALTER COLUMN "teamId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Team" ALTER COLUMN "avatar" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;
