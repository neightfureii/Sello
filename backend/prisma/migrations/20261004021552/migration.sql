-- AlterTable
ALTER TABLE "sales" ALTER COLUMN "bill_no" DROP DEFAULT,
ALTER COLUMN "bill_no" SET DATA TYPE VARCHAR(50);
DROP SEQUENCE "sales_bill_no_seq";
