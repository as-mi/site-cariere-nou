import { signIn, getProviders } from "next-auth/react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { faFacebook, faGoogle } from "@fortawesome/free-brands-svg-icons";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";

type PageProps = {
  availableProviders: string[];
};

const LoginPage: React.FC<PageProps> = ({ availableProviders }) => {
  const router = useRouter();
  console.log(router.query);
  const showAuthenticationRequiredMessage = !!router.query.hasOwnProperty(
    "authenticationRequired"
  );
  const redirectUrl = (router.query.redirectUrl as string) || "/";

  const canSignInWithGoogle = !!availableProviders.find(
    (providerId) => providerId === "google"
  );

  const handleSignInWithGoogle = () => {
    signIn("google", { callbackUrl: redirectUrl });
  };

  return (
    <div className="h-screen bg-black px-4 py-10">
      <main className="mx-auto max-w-sm rounded-lg bg-white px-3 py-5 text-black">
        <div className="text-center">
          <header className="mb-3">
            <h1 className="font-display text-3xl font-bold">Intră în cont</h1>
            <div
              className={`${showAuthenticationRequiredMessage ? "" : "hidden"}`}
            >
              <p className="my-3 rounded-lg bg-amber-300 py-3 text-sm text-black">
                Trebuie să te autentifici înainte de a putea accesa această
                pagină
              </p>
            </div>
          </header>
          <div className="flex flex-col space-y-3">
            <button
              disabled={!canSignInWithGoogle}
              onClick={canSignInWithGoogle ? handleSignInWithGoogle : undefined}
              className="block rounded-md border-2 border-solid border-blue-300 bg-blue-500 px-3 py-2 text-white hover:ring-2 hover:ring-blue-300"
            >
              <FontAwesomeIcon
                icon={faGoogle}
                className="mr-2 inline-block h-4 w-4"
              />{" "}
              Autentificare cu Google
            </button>
            <button
              disabled
              className="block cursor-not-allowed rounded-md border-2 border-solid border-sky-600 bg-sky-800 px-3 py-2 text-white"
              title="Nu este disponibilă momentan"
            >
              <FontAwesomeIcon
                icon={faFacebook}
                className="mr-2 inline-block h-4 w-4"
              />{" "}
              Autentificare cu Facebook
            </button>
            <button
              disabled
              className="border-gray block cursor-not-allowed rounded-md border-2 border-solid px-3 py-2"
              title="Nu este disponibilă momentan"
            >
              <FontAwesomeIcon
                icon={faEnvelope}
                className="mr-2 inline-block h-4 w-4"
              />{" "}
              Autentificare prin e-mail
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const providers = await getProviders();

  const availableProviders =
    providers === null
      ? []
      : Object.values(providers).map((provider) => provider.id);

  return {
    props: {
      availableProviders,
    },
  };
};
