import { ReactElement } from "react";

import { GetServerSideProps } from "next";
import Link from "next/link";

import { Role } from "@prisma/client";

import { NextPageWithLayout } from "~/pages/_app";

import { getServerSession, redirectToLoginPage } from "~/lib/auth";
import prisma from "~/lib/prisma";
import { trpc } from "~/lib/trpc";

import Layout from "~/components/pages/admin/layout";

import CreateFakeObjectButton from "~/components/pages/admin/common/create-fake-object-button";
import AdminEventsTable from "~/components/pages/admin/events/table";
import { DEFAULT_PAGE_SIZE } from "~/components/pages/admin/common/table";

type PageProps = {
  eventsCount: number;
  events: Event[];
};

const AdminEventsPage: NextPageWithLayout<PageProps> = ({
  eventsCount,
  events,
}) => (
  <>
    <header>
      <h1 className="my-2 font-display text-3xl">Evenimente</h1>
      <p className="my-2">
        {eventsCount == 1
          ? `Există 1 eveniment`
          : `Sunt ${eventsCount} evenimente`}{" "}
        în platformă.
      </p>
      <p className="my-4 space-x-4">
        <Link
          href="/admin/events/new"
          className="inline-block rounded-md bg-blue-600 py-2 px-3"
        >
          Adaugă un eveniment nou
        </Link>
        {process.env.NODE_ENV === "development" && (
          <CreateFakeObjectButton
            label="Generează un nou eveniment cu date fake"
            createFakeObjectProcedure={trpc.admin.event.createFake}
            invalidateQueryProcedure={trpc.admin.event.readMany}
          />
        )}
      </p>
    </header>
    <AdminEventsTable
      initialData={{
        pageCount: Math.ceil(eventsCount / DEFAULT_PAGE_SIZE),
        results: events,
      }}
    />
  </>
);
export default AdminEventsPage;

AdminEventsPage.getLayout = (page: ReactElement) => (
  <Layout title="Evenimente">{page}</Layout>
);

export const getServerSideProps: GetServerSideProps<PageProps> = async ({
  req,
  res,
  resolvedUrl,
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
        eventsCount: 0,
        events: [],
      },
    };
  }

  const eventsCount = await prisma.event.count();
  const events = await prisma.event.findMany({
    select: {
      id: true,
      name: true,
      date: true,
    },
    orderBy: [{ id: "asc" }],
  });

  return {
    props: {
      session,
      eventsCount,
      events: events.map((event) => ({
        ...event,
        date: event.date.toLocaleDateString("ro", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
      })),
    },
  };
};
