import { ReactElement, useEffect } from "react";

import { GetServerSideProps } from "next";
import Link from "next/link";
import { useRouter } from "next/router";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

import { Company } from "@prisma/client";

import { NextPageWithLayout } from "~/pages/_app";
import Layout from "~/components/pages/admin/layout";
import prisma from "~/lib/prisma";
import { trpc } from "~/lib/trpc";

type PageProps = {
  companiesCount: number;
  companies: Pick<Company, "id" | "name" | "packageType">[];
};

const AdminCompaniesPage: NextPageWithLayout<PageProps> = ({
  companiesCount,
  companies,
}) => {
  const revalidateHomePageMutation =
    trpc.admin.revalidateHomePage.useMutation();

  const handleRevalidation = () => {
    revalidateHomePageMutation.mutate();
  };

  const router = useRouter();

  const companyDeleteMutation = trpc.admin.company.delete.useMutation({
    onSuccess: () => router.push("/admin/companies"),
    onError: (error) =>
      alert(`Eroare la ștergerea companiei: ${error.message}`),
  });

  useEffect(() => {
    if (revalidateHomePageMutation.isSuccess) {
      alert("Prima pagină a fost actualizată cu succes!");
    }
  }, [revalidateHomePageMutation.isSuccess]);

  const handleCompanyDelete = (companyId: number) => {
    if (window.confirm("Sigur vrei să ștergi această companie?")) {
      companyDeleteMutation.mutate({ id: companyId });
    }
  };

  return (
    <>
      <header>
        <Link href="/admin" className="text-green-400 hover:text-green-300">
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2 h-4 w-4" />
          Înapoi
        </Link>
        <h1 className="my-2 font-display text-3xl">Companii</h1>
        <p className="my-2">
          {companiesCount == 1
            ? `Există 1 companie`
            : `Sunt ${companiesCount} companii`}{" "}
          în baza de date.
        </p>
        <p className="my-4 flex flex-row flex-wrap items-center justify-center gap-4 sm:justify-start">
          <Link
            href="/admin/companies/new"
            className="inline-block rounded-md bg-blue-600 py-2 px-3"
          >
            Adaugă o companie nouă
          </Link>
          <button
            onClick={handleRevalidation}
            className="inline-block rounded-md bg-blue-600 py-2 px-3"
          >
            Regenerează prima pagină
          </button>
        </p>
      </header>
      <div className="overflow-x-auto">
        <table className="w-full text-center">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nume</th>
              <th>Pachet</th>
              <th>Acțiuni</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((company) => (
              <tr key={company.id}>
                <th scope="row" className="px-3">
                  {company.id}
                </th>
                <td className="px-3">{company.name}</td>
                <td className="px-3">{company.packageType}</td>
                <td className="flex flex-col px-3">
                  <Link href={`/admin/companies/${company.id}/edit`}>
                    Editează
                  </Link>
                  <button
                    onClick={() => handleCompanyDelete(company.id)}
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

export default AdminCompaniesPage;

AdminCompaniesPage.getLayout = (page: ReactElement) => (
  <Layout title="Companii">{page}</Layout>
);

export const getServerSideProps: GetServerSideProps<PageProps> = async () => {
  const companiesCount = await prisma.company.count();
  const companies = await prisma.company.findMany({
    select: {
      id: true,
      name: true,
      packageType: true,
    },
  });

  return {
    props: {
      companiesCount,
      companies,
    },
  };
};
