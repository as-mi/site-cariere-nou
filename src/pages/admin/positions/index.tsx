import { ReactElement } from "react";

import { GetServerSideProps } from "next";
import Link from "next/link";
import { useRouter } from "next/router";

import { Prisma } from "@prisma/client";

import { NextPageWithLayout } from "~/pages/_app";
import Layout from "~/components/pages/admin/layout";
import prisma from "~/lib/prisma";
import { trpc } from "~/lib/trpc";

const positionWithCompanyName = Prisma.validator<Prisma.PositionArgs>()({
  select: {
    id: true,
    title: true,
    company: {
      select: {
        name: true,
      },
    },
  },
});

type PositionWithCompanyName = Prisma.PositionGetPayload<
  typeof positionWithCompanyName
>;

type PageProps = {
  positionsCount: number;
  positions: PositionWithCompanyName[];
};

const AdminPositionsPage: NextPageWithLayout<PageProps> = ({
  positionsCount,
  positions,
}) => {
  const router = useRouter();

  const positionDeleteMutation = trpc.admin.position.delete.useMutation({
    onSuccess: () => router.push("/admin/positions"),
    onError: (error) => alert(`Eroare la ștergerea postului: ${error.message}`),
  });

  const handlePositionDelete = (positionId: number) => {
    if (window.confirm("Sigur vrei să ștergi acest post?")) {
      positionDeleteMutation.mutate({ id: positionId });
    }
  };

  return (
    <>
      <header>
        <h1 className="my-2 font-display text-3xl">Posturi</h1>
        <p className="my-2">
          {positionsCount == 1
            ? `Există 1 post`
            : `Sunt ${positionsCount} posturi`}{" "}
          în baza de date.
        </p>
        <p className="my-4 flex flex-row flex-wrap items-center justify-center gap-4 sm:justify-start">
          <Link
            href="/admin/positions/new"
            className="inline-block rounded-md bg-blue-600 py-2 px-3"
          >
            Adaugă un post nou
          </Link>
        </p>
      </header>
      <div className="overflow-x-auto">
        <table className="w-full text-center">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nume companie</th>
              <th>Titlu post</th>
              <th>Acțiuni</th>
            </tr>
          </thead>
          <tbody>
            {positions.map((position) => (
              <tr key={position.id}>
                <th scope="row" className="px-3">
                  {position.id}
                </th>
                <td className="px-3">{position.company.name}</td>
                <td className="px-3">{position.title}</td>
                <td className="flex flex-col px-3">
                  <Link href={`/admin/positions/${position.id}/edit`}>
                    Editează
                  </Link>
                  <button
                    onClick={() => handlePositionDelete(position.id)}
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

export default AdminPositionsPage;

AdminPositionsPage.getLayout = (page: ReactElement) => (
  <Layout title="Posturi">{page}</Layout>
);

export const getServerSideProps: GetServerSideProps<PageProps> = async () => {
  const positionsCount = await prisma.position.count();
  const positions = await prisma.position.findMany({
    ...positionWithCompanyName,
    orderBy: [{ id: "asc" }],
  });

  return {
    props: {
      positionsCount,
      positions,
    },
  };
};
