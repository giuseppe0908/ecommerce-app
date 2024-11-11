/*
  Warnings:

  - You are about to drop the `BRAND` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CATEGORY` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ITEM` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ORDINE` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `USER` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `ITEM` DROP FOREIGN KEY `ITEM_brandId_fkey`;

-- DropForeignKey
ALTER TABLE `ITEM` DROP FOREIGN KEY `ITEM_categoryId_fkey`;

-- DropForeignKey
ALTER TABLE `ORDINE` DROP FOREIGN KEY `ORDINE_idUtente_fkey`;

-- DropTable
DROP TABLE `BRAND`;

-- DropTable
DROP TABLE `CATEGORY`;

-- DropTable
DROP TABLE `ITEM`;

-- DropTable
DROP TABLE `ORDINE`;

-- DropTable
DROP TABLE `USER`;

-- CreateTable
CREATE TABLE `Item` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `categoryId` INTEGER NOT NULL,
    `brandId` INTEGER NOT NULL,
    `preferity` BOOLEAN NOT NULL,
    `promo` BOOLEAN NOT NULL,
    `price` DOUBLE NOT NULL,
    `photo` VARCHAR(191) NOT NULL,
    `codeItem` VARCHAR(191) NOT NULL,
    `percentualPromo` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Brand` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Category` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `surname` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Order` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `idUtente` INTEGER NOT NULL,
    `codeId` VARCHAR(191) NOT NULL,
    `price` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Item` ADD CONSTRAINT `Item_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Item` ADD CONSTRAINT `Item_brandId_fkey` FOREIGN KEY (`brandId`) REFERENCES `Brand`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_idUtente_fkey` FOREIGN KEY (`idUtente`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
