-- CreateEnum
CREATE TYPE "public"."TipoConteudo" AS ENUM ('TEXTO', 'PDF', 'LINK');

-- AlterTable
ALTER TABLE "public"."Conteudo" ADD COLUMN     "caminhoArquivo" TEXT,
ADD COLUMN     "nomeArquivo" TEXT,
ADD COLUMN     "tamanho" INTEGER,
ADD COLUMN     "tipo" "public"."TipoConteudo",
ADD COLUMN     "url" TEXT;
