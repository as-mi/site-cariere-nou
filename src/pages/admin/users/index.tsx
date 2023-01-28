import { ReactElement } from "react";

import { GetServerSideProps } from "next";
import Link from "next/link";

import { User } from "@prisma/client";

import { NextPageWithLayout } from "~/pages/_app";
import Layout from "~/components/pages/admin/layout";
import prisma from "~/lib/prisma";

type PageProps = {
  usersCount: number;
  users: Pick<User, "id" | "email" | "name" | "role">[];
};

const AdminUsersPage: NextPageWithLayout<PageProps> = ({
  usersCount,
  users,
}) => {
  const handleUserResetPassword = (userId: number) => {
    console.log("Reset password for user %d", userId);
  };

  const handleUserDelete = (userId: number) => {
    console.log("Delete user %d", userId);
  };

  return (
    <>
      <header>
        <Link href="/admin">Înapoi</Link>
        <h1>Utilizatori</h1>
        <p>
          {usersCount == 1
            ? `Există 1 utilizator înscris`
            : `Sunt ${usersCount} utilizatori înscriși`}{" "}
          în platformă.
        </p>
        <p>
          <Link href="/admin/users/new">Adaugă un utilizator nou</Link>
        </p>
        <table>
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
                <th scope="row">{user.id}</th>
                <td>{user.email}</td>
                <td>{user.name}</td>
                <td>{user.role.toLowerCase()}</td>
                <th>
                  <Link href={`/admin/users/${user.id}/edit`}>Editează</Link>
                  <button onClick={() => handleUserResetPassword(user.id)}>
                    Resetează parola
                  </button>
                  <button onClick={() => handleUserDelete(user.id)}>
                    Șterge
                  </button>
                </th>
              </tr>
            ))}
          </tbody>
        </table>
      </header>
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
  });

  return {
    props: {
      usersCount,
      users,
    },
  };
};
