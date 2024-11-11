/*
  Warnings:

  - You are about to drop the column `preferity` on the `Item` table. All the data in the column will be lost.
  - Added the required column `favorite` to the `Item` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Item` DROP COLUMN `preferity`,
    ADD COLUMN `favorite` BOOLEAN NOT NULL;
