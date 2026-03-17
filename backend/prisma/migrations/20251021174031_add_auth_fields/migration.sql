/*
  Warnings:

  - Added the required column `passwordHash` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `User` ADD COLUMN `passwordHash` VARCHAR(191) NOT NULL,
    ADD COLUMN `role` ENUM('CUSTOMER', 'VENDOR') NOT NULL DEFAULT 'CUSTOMER';
