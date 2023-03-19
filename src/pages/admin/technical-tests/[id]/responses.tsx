import _ from "lodash";
import { ReactElement } from "react";

import { GetServerSideProps } from "next";

import { Role } from "@prisma/client";

import { DEFAULT_PAGE_SIZE } from "~/api/pagination";

import { getServerSession, redirectToLoginPage } from "~/lib/auth";
import prisma from "~/lib/prisma";
import { formatTimestamp } from "~/lib/technical-tests-schema";

import { NextPageWithLayout } from "~/pages/_app";

import Layout from "~/components/pages/admin/layout";

import AdminTechnicalTestResponsesPageHeader from "~/components/pages/admin/technical-tests/responses/header";
import AdminTechnicalTestResponsesTable, {
  Response,
} from "~/components/pages/admin/technical-tests/responses/table";

type PageProps = {
  technicalTestId: number;
  responsesCount: number;
  responses: Response[];
};

const AdminTechnicalTestResponsesPage: NextPageWithLayout<PageProps> = ({
  technicalTestId,
  responsesCount,
  responses,
}) => (
  <>
    <AdminTechnicalTestResponsesPageHeader responsesCount={responsesCount} />
    <AdminTechnicalTestResponsesTable
      technicalTestId={technicalTestId}
      initialData={{
        pageCount: Math.ceil(responsesCount / DEFAULT_PAGE_SIZE),
        results: responses,
      }}
    />
  </>
);

export default AdminTechnicalTestResponsesPage;

AdminTechnicalTestResponsesPage.getLayout = (page: ReactElement) => (
  <Layout title="Respondenți">{page}</Layout>
);

export const getServerSideProps: GetServerSideProps<PageProps> = async ({
  req,
  res,
  resolvedUrl,
  params,
}) => {
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

  const session = await getServerSession(req, res);

  const returnUrl = resolvedUrl;

  if (!session || !session.user) {
    return redirectToLoginPage(returnUrl);
  }

  if (session.user.role !== Role.ADMIN) {
    return {
      props: {
        session,
        technicalTestId,
        responsesCount: -1,
        responses: [],
      },
    };
  }

  const technicalTest = await prisma.technicalTest.findUnique({
    where: { id: technicalTestId },
    select: {
      title: true,
    },
  });

  if (!technicalTest) {
    return {
      notFound: true,
    };
  }

  const responsesCount = await prisma.participantAnswersToTechnicalTest.count({
    where: { technicalTestId },
  });
  const answers = await prisma.participantAnswersToTechnicalTest.findMany({
    where: { technicalTestId },
    select: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
      createdAt: true,
    },
    take: DEFAULT_PAGE_SIZE,
    orderBy: [{ userId: "asc" }],
  });

  const userIds = answers.map((answer) => answer.user.id);

  const startTimes = await prisma.participantStartTechnicalTest.findMany({
    where: {
      technicalTestId,
      userId: { in: userIds },
    },
    select: {
      userId: true,
      startTime: true,
    },
  });

  const startTimesByUserId = _.mapValues(
    _.keyBy(startTimes, (startTime) => startTime.userId),
    (obj) => obj.startTime
  );

  const responses = answers.map((answer) => ({
    user: answer.user,
    startTime: formatTimestamp(startTimesByUserId[answer.user.id]),
    endTime: formatTimestamp(answer.createdAt),
  }));

  return {
    props: {
      session,
      technicalTestId,
      responsesCount,
      responses,
    },
  };
};
