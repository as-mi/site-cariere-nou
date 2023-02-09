import { ReactElement } from "react";

import { GetServerSideProps } from "next";
import Link from "next/link";
import { useRouter } from "next/router";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

import { User } from "@prisma/client";

import { NextPageWithLayout } from "~/pages/_app";
import Layout from "~/components/pages/admin/layout";
import prisma from "~/lib/prisma";
import { trpc } from "~/lib/trpc";

type PageProps = {
  usersCount: number;
  users: Pick<User, "id" | "email" | "name" | "role">[];
};

const AdminUsersPage: NextPageWithLayout<PageProps> = ({
  usersCount,
  users,
}) => {
  const router = useRouter();

  const userDeleteMutation = trpc.admin.user.delete.useMutation({
    onSuccess: () => router.push("/admin/users"),
    onError: (error) =>
      alert(`Eroare la ștergerea utilizatorului: ${error.message}`),
  });

  const handleUserResetPassword = (userId: number) => {
    console.log("Reset password for user %d", userId);
  };

  const handleUserDelete = (userId: number) => {
    if (window.confirm("Sigur vrei să ștergi acest utilizator?")) {
      userDeleteMutation.mutate({ id: userId });
    }
  };

  return (
    <>
      <header>
        <h1 className="my-2 font-display text-3xl">Utilizatori</h1>
        <p className="my-2">
          {usersCount == 1
            ? `Există 1 utilizator înscris`
            : `Sunt ${usersCount} utilizatori înscriși`}{" "}
          în platformă.
        </p>
        <p className="my-4">
          <Link
            href="/admin/users/new"
            className="inline-block rounded-md bg-blue-600 py-2 px-3"
          >
            Adaugă un utilizator nou
          </Link>
        </p>
      </header>
      <div className="overflow-x-auto">
        <table className="w-full text-center">
          <thead>
            <tr>
              <th>ID</th>
              <th>E-mail</th>
              <th>Nume</th>
              <th>Rol</th>
              <th>Acțiuni</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <th scope="row" className="px-3">
                  {user.id}
                </th>
                <td className="px-3">{user.email}</td>
                <td className="px-3">{user.name}</td>
                <td className="px-3">{user.role.toLowerCase()}</td>
                <td className="flex flex-col px-3">
                  <Link href={`/admin/users/${user.id}/edit`}>Editează</Link>
                  <button
                    onClick={() => handleUserResetPassword(user.id)}
                    className="block"
                  >
                    Resetează parola
                  </button>
                  <button
                    onClick={() => handleUserDelete(user.id)}
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

export default AdminUsersPage;

AdminUsersPage.getLayout = (page: ReactElement) => (
  <Layout title="Utilizatori">{page}</Layout>
);

export const getServerSideProps: GetServerSideProps<PageProps> = async () => {
  const usersCount = await prisma.user.count();
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
    orderBy: [{ id: "asc" }],
  });

  return {
    props: {
      usersCount,
      users,
    },
  };
};
