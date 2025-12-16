/*
  Warnings:

  - Added the required column `entryPath` to the `projects` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "entryPath" TEXT NOT NULL,
ALTER COLUMN "baseUrl" SET DEFAULT 'src/app.ts';
