/*
  Warnings:

  - Made the column `user_id` on table `stock_records` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "stock_records" ALTER COLUMN "user_id" SET NOT NULL;
