/*
  Warnings:

  - Made the column `total_amount` on table `stock_records` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "stock_records" ALTER COLUMN "total_amount" SET NOT NULL;
