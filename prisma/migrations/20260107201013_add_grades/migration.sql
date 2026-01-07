/*
  Warnings:

  - You are about to drop the `MateriaAprobada` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "MateriaAprobada";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "MateriaProgreso" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "materiaId" INTEGER NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'APROBADA',
    "nota" REAL,
    "aplazos" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MateriaProgreso_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "MateriaProgreso_userId_materiaId_key" ON "MateriaProgreso"("userId", "materiaId");
