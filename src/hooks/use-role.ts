import { Role } from "@prisma/client";

import useUser from "./use-user";

/**
 * Custom hook which returns the currently logged-in user's role.
 *
 * @returns the current user's role, or `undefined` if not logged in.
 */
const useRole = (): Role | undefined => {
  const user = useUser();

  return user?.role;
};

export default useRole;

/**
 * Custom hook which returns if the currently logged-in user is an admin.
 *
 * @returns `true` if the user is logged into an admin account, `false` if otherwise.
 */
export const useIsAdmin = (): boolean => {
  const role = useRole();

  return role === Role.ADMIN;
};
