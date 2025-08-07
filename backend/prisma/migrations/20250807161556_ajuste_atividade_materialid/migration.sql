/*
  Warnings:

  - Added the required column `materialId` to the `Atividade` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Atividade" ADD COLUMN     "materialId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Atividade" ADD CONSTRAINT "Atividade_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "public"."Material"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
