import { ReactElement } from "react";

import Link from "next/link";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

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
};

const AdminTechnicalTestsPage: NextPageWithLayout = () => {
  const technicalTestsCount: number = 0;
  const technicalTests: TechnicalTest[] = [];

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
                <td className="flex flex-col px-3">
                  <Link
                    href={`/admin/technical-tests/${technicalTest.id}/edit`}
                  >
                    Editează
                  </Link>
                  <button className="block">Șterge</button>
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
