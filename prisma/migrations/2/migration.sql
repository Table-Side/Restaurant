-- AlterTable
ALTER TABLE "Item" DROP COLUMN "price",
ADD COLUMN     "price" MONEY NOT NULL;

