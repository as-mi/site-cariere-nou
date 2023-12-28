import { ReactElement } from "react";

import { GetServerSideProps } from "next";
import Link from "next/link";

import Showdown from "showdown";

import { Role } from "@prisma/client";

import { getServerSession, redirectToLoginPage } from "~/lib/auth";
import prisma from "~/lib/prisma";

import { NextPageWithLayout } from "~/pages/_app";

import Layout from "~/components/pages/admin/layout";
import Button from "~/components/pages/admin/common/button";

type Company = {
  id: number;
  name: string;
  positionsCount: number;
  applicantsCount: number;
  applicationsCount: number;
  descriptionHtml: string;
};

type PageProps = {
  company: Company;
};

const AdminViewCompanyPage: NextPageWithLayout<PageProps> = ({ company }) => (
  <>
    <header>
      <Link href="/admin/companies">Înapoi</Link>
      <h1 className="mt-3 mb-1 font-display text-2xl font-bold">
        Afișează detaliile unei companii
      </h1>
    </header>
    <div className="space-y-4">
      <section>
        <h2 className="font-display text-xl font-semibold">Nume</h2>
        <p>{company.name}</p>
      </section>
      <section>
        <h2 className="font-display text-xl font-semibold">Posturi</h2>
        <p>
          Această companie{" "}
          {company.positionsCount === 0
            ? "nu a publicat încă niciun post"
            : company.positionsCount === 1
              ? "a publicat un singur post"
              : `are ${company.positionsCount} posturi publicate`}{" "}
          în platformă.
        </p>
      </section>
      <section>
        <h2 className="font-display text-xl font-semibold">Aplicanți</h2>
        <p>
          Pe posturile acestei companii{" "}
          {company.applicantsCount === 0
            ? "nu a aplicat încă niciun participant"
            : company.applicantsCount === 1
              ? "a aplicat un singur participant"
              : `au aplicat în total ${company.applicantsCount} de participanți`}
          .
        </p>
      </section>
      <section>
        <h2 className="font-display text-xl font-semibold">Aplicări</h2>
        <p>
          Pe posturile acestei companii{" "}
          {company.applicationsCount === 0
            ? "nu există încă aplicări"
            : company.applicationsCount === 1
              ? "există o singură aplicare"
              : `există ${company.applicationsCount} de aplicări`}
          .
        </p>
        <p className="mt-3">
          <Button
            as={Link}
            href={`/api/resumes/download?companyId=${company.id}`}
          >
            Descarcă toate CV-urile pentru această companie
          </Button>
        </p>
      </section>
      <section>
        <h2 className="font-display text-xl font-semibold">Descriere</h2>
        <div className="prose prose-invert max-w-prose border px-4 xs:px-8">
          <div dangerouslySetInnerHTML={{ __html: company.descriptionHtml }} />
        </div>
      </section>
    </div>
  </>
);

export default AdminViewCompanyPage;

AdminViewCompanyPage.getLayout = (page: ReactElement) => (
  <Layout title="Afișează detaliile unei companii">{page}</Layout>
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
        company: null as unknown as Company,
      },
    };
  }

  const id = params?.id;
  if (typeof id !== "string") {
    return {
      notFound: true,
    };
  }

  const companyId = parseInt(id);
  if (Number.isNaN(companyId)) {
    return {
      notFound: true,
    };
  }

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: {
      id: true,
      name: true,
      description: true,
    },
  });

  if (!company) {
    return {
      notFound: true,
    };
  }

  const positionsCount = await prisma.position.count({
    where: { companyId },
  });
  const countParticipantsQueryResult = await prisma.$queryRaw<
    {
      count: number;
    }[]
  >`
    SELECT COUNT (DISTINCT "User"."id") AS count
    FROM "User"
    INNER JOIN "ParticipantApplyToPosition" ON "User"."id" = "ParticipantApplyToPosition"."userId"
    INNER JOIN "Position" ON "ParticipantApplyToPosition"."positionId" = "Position"."id"
    WHERE "Position"."companyId" = ${companyId}
  `;
  const applicantsCount = Number(countParticipantsQueryResult[0].count);

  const applicationsCount = await prisma.participantApplyToPosition.count({
    where: { position: { companyId } },
  });

  const showdown = new Showdown.Converter();
  const descriptionHtml = showdown.makeHtml(company.description);

  return {
    props: {
      session,
      company: {
        id: companyId,
        name: company.name,
        positionsCount,
        applicantsCount,
        applicationsCount,
        descriptionHtml,
      },
    },
  };
};
