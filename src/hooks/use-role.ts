import { Role } from "@prisma/client";

import useUser from "./use-user";

const useRole = (): Role | undefined => {
  const user = useUser();

  return user?.role;
};

export default useRole;
