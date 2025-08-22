-- CreateEnum
CREATE TYPE "public"."TipoAviso" AS ENUM ('GERAL', 'URGENTE', 'EVENTO', 'LEMBRETE', 'COMUNICADO');

-- CreateEnum
CREATE TYPE "public"."PrioridadeAviso" AS ENUM ('BAIXA', 'NORMAL', 'ALTA', 'CRITICA');

-- CreateTable
CREATE TABLE "public"."Aviso" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "conteudo" TEXT NOT NULL,
    "tipo" "public"."TipoAviso" NOT NULL DEFAULT 'GERAL',
    "prioridade" "public"."PrioridadeAviso" NOT NULL DEFAULT 'NORMAL',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "professorId" TEXT NOT NULL,
    "dataInicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataExpiracao" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Aviso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_AvisoTurmas" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_AvisoTurmas_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_AvisoTurmas_B_index" ON "public"."_AvisoTurmas"("B");

-- AddForeignKey
ALTER TABLE "public"."Aviso" ADD CONSTRAINT "Aviso_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_AvisoTurmas" ADD CONSTRAINT "_AvisoTurmas_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Aviso"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_AvisoTurmas" ADD CONSTRAINT "_AvisoTurmas_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Turma"("id") ON DELETE CASCADE ON UPDATE CASCADE;
