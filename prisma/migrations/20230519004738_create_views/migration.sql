CREATE VIEW "SurveyWithAnswer" AS
    SELECT s.id, s.title, COUNT(*) AS answerCount
    FROM "Survey" s
        INNER JOIN "Answer" a
        ON s.id = a."surveyId"
    GROUP BY s.id, s.title;