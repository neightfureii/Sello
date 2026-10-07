-- AlterTable
ALTER TABLE "stock_records" ADD COLUMN     "user_id" UUID;

-- AddForeignKey
ALTER TABLE "stock_records" ADD CONSTRAINT "stock_records_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
