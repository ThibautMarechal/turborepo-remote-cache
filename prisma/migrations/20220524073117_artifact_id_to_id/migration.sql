/*
  Warnings:

  - The primary key for the `Artifact` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `artifactId` on the `Artifact` table. All the data in the column will be lost.
  - Added the required column `id` to the `Artifact` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Artifact" DROP CONSTRAINT "Artifact_pkey",
DROP COLUMN "artifactId",
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "Artifact_pkey" PRIMARY KEY ("id");
