import { ReactElement } from "react";

import { GetServerSideProps } from "next";

import { Role } from "@prisma/client";

import { NextPageWithLayout } from "~/pages/_app";

import { getServerSession, redirectToLoginPage } from "~/lib/auth";
import prisma from "~/lib/prisma";

import { PaginatedData } from "~/data/pagination";
import Events, { Event } from "~/data/events";

import Layout from "~/components/pages/admin/layout";

import AdminEventsTable from "~/components/pages/admin/events/table";
import AdminEventsPageHeader from "~/components/pages/admin/events/header";

type PageProps = {
  eventsCount: number;
  events: PaginatedData<Event>;
};

const AdminEventsPage: NextPageWithLayout<PageProps> = ({
  eventsCount,
  events,
}) => (
  <>
    <AdminEventsPageHeader eventsCount={eventsCount} />
    <AdminEventsTable initialData={events} />
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
        events: { pageCount: 0, results: [] },
      },
    };
  }

  const eventsCount = await prisma.event.count();
  const events = await Events.getPaginated();

  return {
    props: {
      session,
      eventsCount,
      events,
    },
  };
};
