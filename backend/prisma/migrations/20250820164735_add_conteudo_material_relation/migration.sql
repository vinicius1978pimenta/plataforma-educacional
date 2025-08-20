/*
  Warnings:

  - Added the required column `materialId` to the `Conteudo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Conteudo" ADD COLUMN     "materialId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Conteudo" ADD CONSTRAINT "Conteudo_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "public"."Material"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
