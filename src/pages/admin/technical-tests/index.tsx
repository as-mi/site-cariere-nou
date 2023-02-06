import { ReactElement } from "react";

import { GetServerSideProps } from "next";
import Link from "next/link";
import { useRouter } from "next/router";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

import prisma from "~/lib/prisma";
import { trpc } from "~/lib/trpc";

import { NextPageWithLayout } from "~/pages/_app";
import Layout from "~/components/pages/admin/layout";

type TechnicalTest = {
  id: number;
  title: string;
  position: {
    title: string;
    company: {
      name: string;
    };
  };
  activePosition: {
    id: number;
  } | null;
};

type PageProps = {
  technicalTestsCount: number;
  technicalTests: TechnicalTest[];
};

const AdminTechnicalTestsPage: NextPageWithLayout<PageProps> = ({
  technicalTestsCount,
  technicalTests,
}) => {
  const router = useRouter();

  const technicalTestDeleteMutation =
    trpc.admin.technicalTest.delete.useMutation({
      onSuccess: () => router.push("/admin/technical-tests"),
      onError: (error) =>
        alert(`Eroare la ștergerea testului tehnic: ${error.message}`),
    });

  const handleTechnicalTestDelete = (technicalTestId: number) => {
    if (window.confirm("Sigur vrei să ștergi acest test tehnic?")) {
      technicalTestDeleteMutation.mutate({ id: technicalTestId });
    }
  };

  return (
    <>
      <header>
        <Link href="/admin" className="text-green-400 hover:text-green-300">
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2 h-4 w-4" />
          Înapoi
        </Link>
        <h1 className="my-2 font-display text-3xl">Teste tehnice</h1>
        <p className="my-2">
          {technicalTestsCount == 1
            ? `Există 1 test tehnic`
            : `Sunt ${technicalTestsCount} teste tehnice`}{" "}
          în baza de date.
        </p>
        <p className="my-4 flex flex-row flex-wrap items-center justify-center gap-4 sm:justify-start">
          <Link
            href="/admin/technical-tests/new"
            className="inline-block rounded-md bg-blue-600 py-2 px-3"
          >
            Adaugă un test tehnic nou
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
              <th>Titlu test</th>
              <th>Activ</th>
              <th>Acțiuni</th>
            </tr>
          </thead>
          <tbody>
            {technicalTests.map((technicalTest) => (
              <tr key={technicalTest.id}>
                <th scope="row" className="px-3">
                  {technicalTest.id}
                </th>
                <td className="px-3">{technicalTest.position.company.name}</td>
                <td className="px-3">{technicalTest.position.title}</td>
                <td className="px-3">{technicalTest.title}</td>
                <td className="px-3">
                  {!!technicalTest.activePosition ? "Da" : "Nu"}
                </td>
                <td className="flex flex-col px-3">
                  <Link
                    href={`/admin/technical-tests/${technicalTest.id}/edit`}
                  >
                    Editează
                  </Link>
                  <button
                    onClick={() => handleTechnicalTestDelete(technicalTest.id)}
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

export default AdminTechnicalTestsPage;

AdminTechnicalTestsPage.getLayout = (page: ReactElement) => (
  <Layout title="Teste tehnice">{page}</Layout>
);

export const getServerSideProps: GetServerSideProps<PageProps> = async () => {
  const technicalTestsCount = await prisma.technicalTest.count();
  const technicalTests = await prisma.technicalTest.findMany({
    select: {
      id: true,
      title: true,
      position: {
        select: {
          title: true,
          company: {
            select: {
              name: true,
            },
          },
        },
      },
      activePosition: {
        select: {
          id: true,
        },
      },
    },
    orderBy: [{ id: "asc" }],
  });

  return {
    props: {
      technicalTestsCount,
      technicalTests,
    },
  };
};
