import { ReactElement } from "react";

import { GetServerSideProps } from "next";
import Link from "next/link";

import { Role } from "@prisma/client";

import { getServerSession, redirectToLoginPage } from "~/lib/auth";
import prisma from "~/lib/prisma";
import { QuestionsSchema } from "~/lib/technical-tests-schema";

import { NextPageWithLayout } from "~/pages/_app";

import Layout from "~/components/pages/admin/layout";
import Button from "~/components/pages/admin/common/button";

type TechnicalTest = {
  id: number;
  title: string;
  description: string;
};

type PageProps = {
  technicalTest: TechnicalTest;
  answersCount: number;
  questionsCount: number;
};

const AdminViewTechnicalTestPage: NextPageWithLayout<PageProps> = ({
  technicalTest,
  answersCount,
  questionsCount,
}) => (
  <>
    <header>
      <Link href="/admin/technical-tests">Înapoi</Link>
      <h1 className="mt-3 mb-1 font-display text-2xl font-bold">
        Afișează detaliile unui test tehnic
      </h1>
    </header>
    <div className="space-y-4">
      <section>
        <h2 className="font-display text-xl font-semibold">Titlu</h2>
        <p>{technicalTest.title}</p>
      </section>
      <section>
        <h2 className="font-display text-xl font-semibold">Descriere</h2>
        <p className="max-w-prose">{technicalTest.description}</p>
      </section>
      <section>
        <h2 className="font-display text-xl font-semibold">Respondenți</h2>
        <p>
          La acest test tehnic au răspuns un total de {answersCount}{" "}
          {answersCount === 1 ? "participant" : "participanți"}.
        </p>
        <p className="mt-3">
          <Button
            as={Link}
            href={`/admin/technical-tests/${technicalTest.id}/responses`}
          >
            Vezi respondenții
          </Button>
        </p>
      </section>
      <section>
        <h2 className="font-display text-xl font-semibold">Întrebări</h2>
        <p>Acest test tehnic conține un total de {questionsCount} întrebări.</p>
        <p className="mt-3">
          <Button as={Link} href={`/technical-tests/${technicalTest.id}`}>
            Previzualizează testul
          </Button>
        </p>
      </section>
    </div>
  </>
);

export default AdminViewTechnicalTestPage;

AdminViewTechnicalTestPage.getLayout = (page: ReactElement) => (
  <Layout title="Afișează detaliile unui test tehnic">{page}</Layout>
);

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

  if (session.user.role !== Role.ADMIN) {
    return {
      props: {
        session,
        technicalTest: null as unknown as TechnicalTest,
        answersCount: -1,
        questionsCount: -1,
      },
    };
  }

  const id = params?.id;
  if (typeof id !== "string") {
    return {
      notFound: true,
    };
  }

  const technicalTestId = parseInt(id);
  if (Number.isNaN(technicalTestId)) {
    return {
      notFound: true,
    };
  }

  const technicalTest = await prisma.technicalTest.findUnique({
    where: { id: technicalTestId },
    select: {
      title: true,
      description: true,
      questions: true,
    },
  });

  if (!technicalTest) {
    return {
      notFound: true,
    };
  }

  const answersCount = await prisma.participantAnswersToTechnicalTest.count({
    where: { technicalTestId },
  });

  const result = QuestionsSchema.safeParse(technicalTest.questions);
  if (!result.success) {
    throw new Error("Failed to parse questions from technical test");
  }
  const questions = result.data;

  return {
    props: {
      session,
      technicalTest: {
        id: technicalTestId,
        title: technicalTest.title,
        description: technicalTest.description,
      },
      answersCount,
      questionsCount: questions.length,
    },
  };
};
