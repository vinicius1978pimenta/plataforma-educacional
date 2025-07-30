-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('ALUNO', 'PROFESSOR', 'RESPONSAVEL');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "public"."Role" NOT NULL,
    "responsavelId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Material" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "conteudo" TEXT NOT NULL,
    "traducao" TEXT,
    "professorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Material_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Vocabulo" (
    "id" TEXT NOT NULL,
    "palavra" TEXT NOT NULL,
    "traducao" TEXT NOT NULL,
    "alunoId" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Vocabulo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Agenda" (
    "id" TEXT NOT NULL,
    "alunoId" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,

    CONSTRAINT "Agenda_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Material" ADD CONSTRAINT "Material_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Vocabulo" ADD CONSTRAINT "Vocabulo_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Agenda" ADD CONSTRAINT "Agenda_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
