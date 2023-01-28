import { Session } from "next-auth";
import { useSession } from "next-auth/react";

const useUser = (): Session["user"] | undefined => {
  const { data: session } = useSession();

  return session?.user;
};

export default useUser;
