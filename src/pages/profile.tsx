import type { GetServerSideProps } from "next";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { unstable_getServerSession } from "next-auth/next";

import { authOptions } from "~/lib/next-auth-options";
import { redirectToLoginPage } from "~/lib/authorization";

const ProfilePage: React.FC = () => {
  const { data: session } = useSession();

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  if (!session || !session.user) {
    return <p>Acces interzis, nu ești autentificat</p>;
  }

  return (
    <div className="h-screen bg-black px-4 py-8">
      <main className="mx-auto max-w-md rounded-lg bg-white px-6 py-6 text-black">
        <h1 className="font-display text-3xl font-bold">Profilul meu</h1>
        <div>
          <span className="font-semibold">Nume complet:</span>{" "}
          {session.user.name}
        </div>
        <div>
          <span className="font-semibold">Rol:</span>{" "}
          {session.user.role.toLowerCase()}
        </div>
        <div className="mt-3 flex flex-row space-x-3">
          <Link
            href="/"
            className="rounded-md bg-green-700 px-3 py-2 text-white"
          >
            Înapoi la pagina principală
          </Link>
          <button
            onClick={handleSignOut}
            className="rounded-md bg-red-600 px-3 py-2 text-white"
          >
            Dezautentificare
          </button>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await unstable_getServerSession(
    context.req,
    context.res,
    authOptions
  );

  const returnUrl = context.resolvedUrl;

  if (!session || !session.user) {
    return redirectToLoginPage(returnUrl);
  }

  return {
    props: {
      session,
    },
  };
};
