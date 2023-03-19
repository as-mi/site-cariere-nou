import _ from "lodash";

import PDFDocument from "pdfkit";

import { Answer, Question, QuestionKind } from "./technical-tests-schema";

export function generateTechnicalTestAnswerSheet(
  userId: number,
  technicalTestId: number,
  technicalTestTitle: string,
  questions: Question[],
  answers: Answer[]
): typeof PDFDocument {
  const doc = new PDFDocument({
    size: "A4",
    lang: "ro",
    info: {
      Title: `Răspunsuri candidat #${userId} la testul tehnic #${technicalTestId}`,
    },
  });

  const filterDiacritics = (text: string) =>
    text.replace(/ă|â/g, "a").replace(/î/g, "i");

  const originalTextMethod = doc.text;
  doc.text = (text: string, x?: any, y?: any, options?: any) =>
    (originalTextMethod as any).call(
      doc,
      filterDiacritics(text),
      x,
      y,
      options
    );

  doc.fontSize(18);
  doc.font("Helvetica-Bold");
  doc.text(technicalTestTitle);
  doc.fontSize(12);
  doc.font("Helvetica");

  doc.moveDown();
  doc.moveDown();

  const answersByQuestionId = _.mapValues(
    _.keyBy(answers, (answer) => answer.questionId),
    (answer) => answer.value
  );

  let correctMarkedQuestions = 0;
  let totalMarkedQuestions = 0;
  questions.forEach(({ id, correctChoiceId }) => {
    if (!correctChoiceId) {
      return;
    }

    totalMarkedQuestions += 1;

    const answer = answersByQuestionId[id];
    const choiceId = Number(answer);
    if (choiceId === correctChoiceId) {
      correctMarkedQuestions += 1;
    }
  });

  if (totalMarkedQuestions > 0) {
    doc.text(
      `Participantul a răspuns corect la ${correctMarkedQuestions} din ${totalMarkedQuestions} întrebări de tip grilă (la care au fost configurate răspunsurile corecte).`
    );
    doc.moveDown();
    doc.moveDown();
  }

  questions.forEach((question, index) => {
    doc.text(`Răspunsul la întrebarea #${index + 1}:`);
    doc.moveDown();

    const answer = answersByQuestionId[question.id];

    doc.fillColor("#444");
    switch (question.kind) {
      case QuestionKind.SHORT_TEXT:
      case QuestionKind.LONG_TEXT:
        doc.text(answer, { indent: 20 });
        break;
      case QuestionKind.SINGLE_CHOICE:
        const choiceId = Number(answer);
        const choice = question.choices!.find(
          (choice) => choice.id === choiceId
        );
        doc.text(choice!.label, { indent: 20 });
        break;

      default:
        throw new Error(`Unknown question kind: ${question.kind}`);
    }
    doc.fillColor("black");

    if (question.correctChoiceId) {
      doc.moveDown();

      const choiceId = Number(answer);
      if (question.correctChoiceId === choiceId) {
        doc.fillColor("green").text("Raspunsul este cel corect");
      } else {
        doc.fillColor("red").text("Raspunsul nu este cel corect");
      }
      doc.fillColor("black");
    }

    doc.moveDown();
    doc.moveDown();
  });

  doc.end();

  return doc;
}
