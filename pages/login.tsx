import { useSession, signIn, signOut } from "next-auth/react";

const LoginForm = () => {
  const { data: session } = useSession();

  const text = session ? (
    <>You&apos;re currently signed in as {session.user?.email}</>
  ) : (
    <>Not signed in</>
  );

  const button = session ? (
    <button
      onClick={() => signOut()}
      className="rounded-full bg-red-700 py-1 px-4 text-white"
    >
      Sign out
    </button>
  ) : (
    <button
      onClick={() => signIn()}
      className="rounded-full bg-blue-700 py-1 px-4 text-white"
    >
      Sign in
    </button>
  );

  return (
    <div className="max-w-prose text-center">
      <div>
        <div className="font-display text-3xl font-bold">Login Form</div>
        <div className="my-3">{text}</div>
        {button}
      </div>
    </div>
  );
};

const LoginPage = () => {
  return (
    <main className="mt-3">
      <LoginForm />
    </main>
  );
};

export default LoginPage;
