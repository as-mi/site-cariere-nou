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

type Position = {
  id: number;
  title: string;
  applicationsCount: number;
  descriptionHtml: string;
};

type PageProps = {
  position: Position;
};

const AdminViewPositionPage: NextPageWithLayout<PageProps> = ({ position }) => (
  <>
    <header>
      <Link href="/admin/positions">Înapoi</Link>
      <h1 className="mt-3 mb-1 font-display text-2xl font-bold">
        Afișează detaliile unei poziții
      </h1>
    </header>
    <div className="space-y-4">
      <section>
        <h2 className="font-display text-xl font-semibold">Titlu</h2>
        <p>{position.title}</p>
      </section>
      <section>
        <h2 className="font-display text-xl font-semibold">Aplicări</h2>
        <p>
          Pe această poziție au aplicat în total {position.applicationsCount}{" "}
          {position.applicationsCount > 0 ? "de" : ""}{" "}
          {position.applicationsCount === 1 ? "participant" : "participanți"}.
        </p>
        <p className="mt-3">
          <Button
            as={Link}
            href={`/api/resumes/download?positionId=${position.id}`}
          >
            Descarcă CV-urile
          </Button>
        </p>
      </section>
      <section>
        <h2 className="font-display text-xl font-semibold">Descriere</h2>
        <div className="prose prose-invert max-w-prose border px-4 xs:px-8">
          <div dangerouslySetInnerHTML={{ __html: position.descriptionHtml }} />
        </div>
      </section>
    </div>
  </>
);

export default AdminViewPositionPage;

AdminViewPositionPage.getLayout = (page: ReactElement) => (
  <Layout title="Afișează detaliile unei poziții">{page}</Layout>
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
        position: null as unknown as Position,
      },
    };
  }

  const id = params?.id;
  if (typeof id !== "string") {
    return {
      notFound: true,
    };
  }

  const positionId = parseInt(id);
  if (Number.isNaN(positionId)) {
    return {
      notFound: true,
    };
  }

  const position = await prisma.position.findUnique({
    where: { id: positionId },
    select: {
      id: true,
      title: true,
      description: true,
      company: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!position) {
    return {
      notFound: true,
    };
  }

  const applicationsCount = await prisma.participantApplyToPosition.count({
    where: { positionId },
  });

  const showdown = new Showdown.Converter();
  const descriptionHtml = showdown.makeHtml(position.description);

  return {
    props: {
      session,
      position: {
        id: positionId,
        title: position.title,
        applicationsCount,
        descriptionHtml,
      },
    },
  };
};
