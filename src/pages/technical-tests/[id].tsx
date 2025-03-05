import { GetServerSideProps, GetStaticProps, NextPage } from "next";
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

import CommonNavBar from "~/components/common/navbar";
import TechnicalTest from "~/components/pages/technical-tests/technical-test";
import Tally_From from "~/components/pages/technical-tests/tally-embed";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

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
    tallyLink: string;
  };
  alreadyAnsweredAt: boolean | null;
  user_id: number;
  isAdmin: boolean;
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
    tallyLink,
  },
  alreadyAnsweredAt,
  user_id,
  isAdmin,
}) => {
  const pageTitle = `${title} - ${companyName} - Cariere v14.0`;
  const { t } = useTranslation("common");

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
      </Head>

      <CommonNavBar
        renderLinks={() => (
          <>
            <li className="md:inline-block">
              <Link href="/" className="block px-5 py-3">
                {t("navbar.home")}
              </Link>
            </li>
            <li className="md:inline-block">
              <Link href="/profile" className="block px-5 py-3">
                {t("navbar.profile")}
              </Link>
            </li>
          </>
        )}
        autoHideLogo={false}
      />

      <div
        className={`min-h-screen pt-28 px-4 py-6 text-white  bg-[url(/images/bg-gradient.svg)] bg-no-repeat bg-cover`}
      >
        <main className="mx-auto h-full ">
          <div className="min-w-full text-white">
            <h1 className="font-display text-5xl font-bold uppercase mb-3">
              {title}
            </h1>
            <hr className="border-gray-600 mb-3"></hr>
            {description && (
              <div className=" ">
                <h2 className="text-white text-4xl">Test Description</h2>
                <p className="my-3">{description}</p>
              </div>
            )}
            <div className="flex justify-center items-center">
              {!alreadyAnsweredAt || isAdmin ? (
                <div className="w-3/4 bg-white/[.5] sm:p-8 sm:px-10 px-2 p-4 rounded-xl sm:text-xl text-lg">
                  <Tally_From
                    tallyLink={tallyLink}
                    userId={user_id}
                    technicalTestId={id}
                  />
                </div>
              ) : (
                <div className="bg-white/[.5] p-8 px-10 rounded-xl">
                  <p className="my-4 mx-auto max-w-sm">
                    Deja ai trimis răspunsurile la acest test tehnic.
                  </p>
                </div>
              )}
            </div>
          </div>
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
  locale,
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
  const isAdmin = user.role == "ADMIN";

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
      tallyLink: true,
    },
  });

  if (!technicalTest) {
    return {
      notFound: true,
    };
  }

  const alreadyAnsweredAt =
    (await prisma.participantAnswersToTechnicalTest.count({
      where: {
        AND: {
          userId: {
            equals: userId,
          },
          technicalTestId: {
            equals: technicalTestId,
          },
        },
      },
    })) != 0;
  console.log(alreadyAnsweredAt);

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

  const user_id = userId;

  return {
    props: {
      technicalTest: {
        ...technicalTest,
        questions: renderedQuestions,
        participantAnswers: null,
      },
      alreadyAnsweredAt,
      user_id,
      isAdmin,
      ...(await serverSideTranslations(locale ?? "ro", ["common"])),
    },
  };
};
