import { ReactElement } from "react";

import { GetServerSideProps } from "next";
import Link from "next/link";
import { useRouter } from "next/router";

import { Role } from "@prisma/client";

import { NextPageWithLayout } from "~/pages/_app";

import { getServerSession, redirectToLoginPage } from "~/lib/auth";
import prisma from "~/lib/prisma";
import { trpc } from "~/lib/trpc";

import Layout from "~/components/pages/admin/layout";

type Event = {
  id: number;
  name: string;
  date: string;
};

type PageProps = {
  eventsCount: number;
  events: Event[];
};

const AdminEventsPage: NextPageWithLayout<PageProps> = ({
  eventsCount,
  events,
}) => {
  const router = useRouter();

  const eventDeleteMutation = trpc.admin.event.delete.useMutation({
    onSuccess: () => router.push("/admin/events"),
    onError: (error) =>
      alert(`Eroare la ștergerea evenimentului: ${error.message}`),
  });

  const handleEventDelete = (eventId: number) => {
    if (window.confirm("Sigur vrei să ștergi acest eveniment?")) {
      eventDeleteMutation.mutate({ id: eventId });
    }
  };

  return (
    <>
      <header>
        <h1 className="my-2 font-display text-3xl">Evenimente</h1>
        <p className="my-2">
          {eventsCount == 1
            ? `Există 1 eveniment`
            : `Sunt ${eventsCount} evenimente`}{" "}
          în platformă.
        </p>
        <p className="my-4">
          <Link
            href="/admin/events/new"
            className="inline-block rounded-md bg-blue-600 py-2 px-3"
          >
            Adaugă un eveniment nou
          </Link>
        </p>
      </header>
      <div className="overflow-x-auto">
        <table className="w-full text-center">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nume</th>
              <th>Dată</th>
              <th>Acțiuni</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id}>
                <th scope="row" className="px-3">
                  {event.id}
                </th>
                <td className="px-3">{event.name}</td>
                <td className="px-3">{event.date}</td>
                <td className="flex flex-col px-3">
                  <Link href={`/admin/events/${event.id}/edit`}>Editează</Link>
                  <button
                    onClick={() => handleEventDelete(event.id)}
                    className="block"
                  >
                    Șterge
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

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
