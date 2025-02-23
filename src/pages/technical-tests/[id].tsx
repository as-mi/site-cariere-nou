import { GetServerSideProps, NextPage } from "next";
import Head from "next/head";

import showdown from "showdown";

import { Role } from "@prisma/client";
import tally_form from "~/components/pages/technical-tests/tally-embed";
import { getBaseUrl } from "~/lib/base-url";

import { getServerSession, redirectToLoginPage } from "~/lib/auth";
import prisma from "~/lib/prisma";
import {
  QuestionKind,
  QuestionsSchema,
  RenderedQuestion,
} from "~/lib/technical-tests-schema";

import TechnicalTest from "~/components/pages/technical-tests/technical-test";
import Tally_From from "~/components/pages/technical-tests/tally-embed";

type PageProps = {
  technicalTest: {
    id: number;
    title: string;
    description: string;
    position: {
      id: number;
      company: {
        name: string;
        slug: string;
      };
    };
    questions: RenderedQuestion[];
  };
  alreadyAnsweredAt: {
    date: string;
    time: string;
  } | null;
};

const TechnicalTestPage: NextPage<PageProps> = ({
  technicalTest: {
    id,
    title,
    description,
    position: {
      id: positionId,
      company: { name: companyName, slug: companySlug },
    },
    questions,
  },
  alreadyAnsweredAt,
}) => {
  const pageTitle = `${title} - ${companyName} - Cariere v13.0`;

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
      </Head>
      <div className={`min-h-screen  px-4 py-6 text-white xs:py-10 sm:py-20 md:py-32 lg:py-40 bg-[url(/images/bg-gradient.svg)] bg-no-repeat bg-cover`}>
        <main className="mx-auto max-w-prose text-center">
          <h1 className="font-display text-3xl font-bold">{title}</h1>
          {description && <p className="my-3">{description}</p>}
          {alreadyAnsweredAt === null ? (
            <>
            {/* <TechnicalTest
              companySlug={companySlug}
              positionId={positionId}
              technicalTestId={id}
              questions={questions}
            /> */}
            <Tally_From />
            </>
          ) : (
            <p className="my-4 mx-auto max-w-sm">
              Deja ai trimis răspunsurile la acest test tehnic la data de{" "}
              {alreadyAnsweredAt.date}, ora {alreadyAnsweredAt.time}.
            </p>
          )}
        </main>
      </div>
    </>
  );
};

export default TechnicalTestPage;

export const getServerSideProps: GetServerSideProps<PageProps> = async ({
  req,
  res,
  resolvedUrl,
  params,
}) => {
  const session = await getServerSession(req, res);

  const returnUrl = resolvedUrl;

  if (!session || !session.user) {
    return redirectToLoginPage(returnUrl);
  }

  const { user } = session;

  const id = params?.id;
  if (typeof id !== "string" || !id) {
    if (process.env.NODE_ENV === "development") {
      throw new Error("`id` route parameter is not a non-empty string");
    } else {
      return {
        notFound: true,
      };
    }
  }

  const technicalTestId = parseInt(id);
  if (Number.isNaN(technicalTestId)) {
    if (process.env.NODE_ENV === "development") {
      throw new Error("`id` route parameter could not be parsed as a valid ID");
    } else {
      return {
        notFound: true,
      };
    }
  }

  const userId = user.id;

  const technicalTest = await prisma.technicalTest.findUnique({
    where: { id: technicalTestId },
    select: {
      id: true,
      title: true,
      description: true,
      position: {
        select: {
          id: true,
          company: {
            select: {
              name: true,
              slug: true,
            },
          },
        },
      },
      questions: true,
      participantAnswers: {
        where: { userId },
        select: {
          createdAt: true,
        },
      },
    },
  });

  if (!technicalTest) {
    return {
      notFound: true,
    };
  }

  let alreadyAnsweredAt = null;
  if (technicalTest.participantAnswers.length > 0) {
    const answerTime = technicalTest.participantAnswers[0].createdAt;
    alreadyAnsweredAt = {
      date: answerTime.toLocaleDateString("ro", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      time: answerTime.toLocaleTimeString("ro", {
        hour: "numeric",
        minute: "numeric",
      }),
    };
  }

  const result = QuestionsSchema.safeParse(technicalTest.questions);
  if (!result.success) {
    throw new Error("Failed to parse questions JSON");
  }

  const converter = new showdown.Converter({ tables: true });

  const questions = result.data;
  const renderedQuestions: RenderedQuestion[] = questions.map((question) => {
    const detailsHtml = converter.makeHtml(question.details);

    return {
      id: question.id,
      title: question.title,
      detailsHtml: detailsHtml,
      kind: question.kind,
      choices:
        question.kind === QuestionKind.SINGLE_CHOICE ? question.choices : [],
    };
  });

  if (user.role === Role.PARTICIPANT) {
    await prisma.participantStartTechnicalTest.upsert({
      where: { userId_technicalTestId: { userId, technicalTestId } },
      create: {
        userId,
        technicalTestId,
        startTime: new Date(),
      },
      update: {},
    });
  }

  return {
    props: {
      technicalTest: {
        ...technicalTest,
        questions: renderedQuestions,
        participantAnswers: null,
      },
      alreadyAnsweredAt,
    },
  };
};
