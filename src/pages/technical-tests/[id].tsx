import { GetServerSideProps, NextPage } from "next";
import Head from "next/head";

import { getServerSession, redirectToLoginPage } from "~/lib/auth";
import prisma from "~/lib/prisma";
import {
  Question,
  QuestionsSchema,
  sanitizeQuestions,
} from "~/lib/technical-tests-schema";

import TechnicalTest from "~/components/pages/technical-tests/technical-test";

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
    questions: Question[];
  };
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
}) => {
  const pageTitle = `${title} - ${companyName} - Cariere v12.0`;

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
      </Head>
      <div className="min-h-screen bg-black px-4 py-6 text-white xs:py-10 sm:py-20 md:py-32 lg:py-40">
        <main className="mx-auto max-w-prose text-center">
          <h1 className="font-display text-3xl font-bold">{title}</h1>
          {description && <p className="my-3">{description}</p>}
          <TechnicalTest
            companySlug={companySlug}
            positionId={positionId}
            technicalTestId={id}
            questions={questions}
          />
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
    },
  });

  if (!technicalTest) {
    return {
      notFound: true,
    };
  }

  const result = QuestionsSchema.safeParse(technicalTest.questions);
  if (!result.success) {
    throw new Error("Failed to parse questions JSON");
  }

  const questions = result.data;
  sanitizeQuestions(questions);

  return {
    props: {
      technicalTest: {
        ...technicalTest,
        questions,
      },
    },
  };
};
