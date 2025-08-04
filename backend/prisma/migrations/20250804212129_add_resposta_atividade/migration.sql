-- CreateEnum
CREATE TYPE "public"."TipoAtividade" AS ENUM ('EXERCICIO', 'PROVA', 'TRABALHO', 'PROJETO', 'LEITURA', 'PESQUISA');

-- CreateEnum
CREATE TYPE "public"."NivelDificuldade" AS ENUM ('FACIL', 'MEDIO', 'DIFICIL');

-- CreateEnum
CREATE TYPE "public"."StatusResposta" AS ENUM ('RASCUNHO', 'ENVIADA', 'CORRIGIDA', 'DEVOLVIDA');

-- CreateTable
CREATE TABLE "public"."Atividade" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "conteudo" TEXT NOT NULL,
    "materia" TEXT NOT NULL,
    "tipo" "public"."TipoAtividade" NOT NULL DEFAULT 'EXERCICIO',
    "dificuldade" "public"."NivelDificuldade" NOT NULL DEFAULT 'MEDIO',
    "pontuacao" INTEGER,
    "tempoEstimado" INTEGER,
    "instrucoes" TEXT,
    "professorId" TEXT NOT NULL,
    "turmaId" TEXT,
    "dataVencimento" TIMESTAMP(3),
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Atividade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RespostaAtividade" (
    "id" TEXT NOT NULL,
    "atividadeId" TEXT NOT NULL,
    "alunoId" TEXT NOT NULL,
    "resposta" TEXT NOT NULL,
    "anexos" TEXT[],
    "nota" DOUBLE PRECISION,
    "feedback" TEXT,
    "status" "public"."StatusResposta" NOT NULL DEFAULT 'ENVIADA',
    "dataEnvio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataCorrecao" TIMESTAMP(3),

    CONSTRAINT "RespostaAtividade_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RespostaAtividade_atividadeId_alunoId_key" ON "public"."RespostaAtividade"("atividadeId", "alunoId");

-- AddForeignKey
ALTER TABLE "public"."Atividade" ADD CONSTRAINT "Atividade_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Atividade" ADD CONSTRAINT "Atividade_turmaId_fkey" FOREIGN KEY ("turmaId") REFERENCES "public"."Turma"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RespostaAtividade" ADD CONSTRAINT "RespostaAtividade_atividadeId_fkey" FOREIGN KEY ("atividadeId") REFERENCES "public"."Atividade"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RespostaAtividade" ADD CONSTRAINT "RespostaAtividade_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
