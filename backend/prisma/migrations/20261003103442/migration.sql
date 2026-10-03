/*
  Warnings:

  - Made the column `shop_id` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "users" ALTER COLUMN "shop_id" SET NOT NULL;
