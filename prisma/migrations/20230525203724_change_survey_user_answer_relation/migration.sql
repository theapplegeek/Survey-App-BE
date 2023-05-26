/*
  Warnings:

  - You are about to drop the `AnswerUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AnswerUser" DROP CONSTRAINT "AnswerUser_answerId_fkey";

-- DropForeignKey
ALTER TABLE "AnswerUser" DROP CONSTRAINT "AnswerUser_userId_fkey";

-- DropTable
DROP TABLE "AnswerUser";

-- CreateTable
CREATE TABLE "SurveyUser" (
    "surveyId" TEXT NOT NULL,
    "answerId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SurveyUser_pkey" PRIMARY KEY ("answerId","userId","surveyId")
);

-- CreateIndex
CREATE INDEX "SurveyUser_answerId_userId_surveyId_idx" ON "SurveyUser"("answerId", "userId", "surveyId");

-- CreateIndex
CREATE UNIQUE INDEX "SurveyUser_userId_surveyId_key" ON "SurveyUser"("userId", "surveyId");

-- AddForeignKey
ALTER TABLE "SurveyUser" ADD CONSTRAINT "SurveyUser_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "Survey"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyUser" ADD CONSTRAINT "SurveyUser_answerId_fkey" FOREIGN KEY ("answerId") REFERENCES "Answer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyUser" ADD CONSTRAINT "SurveyUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE RESTRICT;
