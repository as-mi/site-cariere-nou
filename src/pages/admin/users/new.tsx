import { ReactElement } from "react";

import Link from "next/link";

import { NextPageWithLayout } from "~/pages/_app";
import Layout from "~/components/pages/admin/layout";

const AdminNewUserPage: NextPageWithLayout = () => {
  return (
    <>
      <header>
        <Link href="/admin/users">Înapoi</Link>
        <h1>Adaugă un nou utilizator</h1>
      </header>
      <form></form>
    </>
  );
};

export default AdminNewUserPage;

AdminNewUserPage.getLayout = (page: ReactElement) => (
  <Layout title="Adaugă un nou utilizator">{page}</Layout>
);
