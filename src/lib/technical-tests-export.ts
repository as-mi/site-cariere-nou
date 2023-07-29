import _ from "lodash";

import PDFDocument from "pdfkit";

import { Answer, Question, QuestionKind } from "./technical-tests-schema";

/**
 * Encodes a file name so it can be properly included in the `Content-Disposition` header.
 */
// Based on https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent#encoding_for_content-disposition_and_link_headers
const encodeRFC5987ValueChars = (fileName: string): string =>
  encodeURIComponent(fileName)
    // The following creates the sequences %27 %28 %29 %2A (Note that
    // the valid encoding of "*" is %2A, which necessitates calling
    // toUpperCase() to properly encode). Although RFC3986 reserves "!",
    // RFC5987 does not, so we do not need to escape it.
    .replace(/['()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`)
    // The following are not required for percent-encoding per RFC5987,
    // so we can allow for a little better readability over the wire: |`^
    .replace(/%(7C|60|5E)/g, (str, hex) =>
      String.fromCharCode(parseInt(hex, 16)),
    );

/**
 * Generates the appropriate value for the `Content-Disposition` header
 * for downloading a given file.
 */
export const generateAttachmentDispositionHeaderValue = (fileName: string) =>
  `attachment; filename*=UTF-8''${encodeRFC5987ValueChars(fileName)}`;

/**
 * Generates a PDF document summarizing a participant's answers to a technical test.
 */
export function generateTechnicalTestAnswerSheet(
  userId: number,
  technicalTestId: number,
  technicalTestTitle: string,
  questions: Question[],
  answers: Answer[],
): typeof PDFDocument {
  const doc = new PDFDocument({
    size: "A4",
    lang: "ro",
    info: {
      Title: `Răspunsuri candidat #${userId} la testul tehnic #${technicalTestId}`,
    },
  });

  const filterDiacritics = (text?: string) =>
    text?.replace(/ă|â/g, "a")?.replace(/î/g, "i");

  const originalTextMethod = doc.text;
  doc.text = (text: string, x?: any, y?: any, options?: any) =>
    (originalTextMethod as any).call(
      doc,
      filterDiacritics(text),
      x,
      y,
      options,
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
    (answer) => answer.value,
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
      `Participantul a răspuns corect la ${correctMarkedQuestions} din ${totalMarkedQuestions} întrebări de tip grilă (la care au fost configurate răspunsurile corecte).`,
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
          (choice) => choice.id === choiceId,
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
