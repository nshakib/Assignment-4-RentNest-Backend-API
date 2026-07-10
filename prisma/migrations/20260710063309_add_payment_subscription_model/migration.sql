/*
  Warnings:

  - You are about to drop the column `monthNumber` on the `payment` table. All the data in the column will be lost.
  - You are about to drop the column `stripePaymentIntentId` on the `payment` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[stripeInvoiceId]` on the table `payment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[stripeSubscriptionId]` on the table `rental_request` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'CANCELED', 'EXPIRED');

-- DropIndex
DROP INDEX "payment_rentalRequestId_monthNumber_key";

-- DropIndex
DROP INDEX "payment_stripePaymentIntentId_key";

-- AlterTable
ALTER TABLE "payment" DROP COLUMN "monthNumber",
DROP COLUMN "stripePaymentIntentId",
ADD COLUMN     "stripeInvoiceId" TEXT,
ADD COLUMN     "stripeSubscriptionId" TEXT;

-- AlterTable
ALTER TABLE "rental_request" ADD COLUMN     "stripeCustomerId" TEXT,
ADD COLUMN     "stripeSubscriptionId" TEXT,
ADD COLUMN     "subscriptionStatus" "SubscriptionStatus";

-- CreateIndex
CREATE UNIQUE INDEX "payment_stripeInvoiceId_key" ON "payment"("stripeInvoiceId");

-- CreateIndex
CREATE UNIQUE INDEX "rental_request_stripeSubscriptionId_key" ON "rental_request"("stripeSubscriptionId");
