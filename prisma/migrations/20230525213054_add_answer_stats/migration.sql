CREATE VIEW "AnswerStats" AS
SELECT SU."surveyId"                                                       as "surveyId",
       SU."answerId"                                                       as "id",
       A.description                                                       as "description",
       ROUND(COUNT(SU."userId") * 100.0 / (SELECT COUNT(*)
                                     FROM "SurveyUser" SU2
                                     WHERE SU2."surveyId" = SU."surveyId"), 0) AS "percentage"
FROM "SurveyUser" SU
         INNER JOIN "Answer" A on A.id = SU."answerId"
GROUP BY SU."answerId", su."surveyId", A.description