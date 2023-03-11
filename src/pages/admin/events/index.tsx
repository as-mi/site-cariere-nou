import { ReactElement } from "react";

import { GetServerSideProps } from "next";

import { Role } from "@prisma/client";

import { NextPageWithLayout } from "~/pages/_app";

import { getServerSession, redirectToLoginPage } from "~/lib/auth";
import prisma from "~/lib/prisma";

import { DEFAULT_PAGE_SIZE } from "~/api/pagination";

import Layout from "~/components/pages/admin/layout";

import AdminEventsTable, { Event } from "~/components/pages/admin/events/table";
import AdminEventsPageHeader from "~/components/pages/admin/events/header";

type PageProps = {
  eventsCount: number;
  events: Event[];
};

const AdminEventsPage: NextPageWithLayout<PageProps> = ({
  eventsCount,
  events,
}) => (
  <>
    <AdminEventsPageHeader eventsCount={eventsCount} />
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
    skip: 0,
    take: DEFAULT_PAGE_SIZE,
    orderBy: { id: "asc" },
  });

  const serializedEvents = events.map((event) => ({
    ...event,
    date: event.date.toLocaleDateString("ro", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
  }));

  return {
    props: {
      session,
      eventsCount,
      events: serializedEvents,
    },
  };
};
