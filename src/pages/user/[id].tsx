import { User } from "@prisma/client";

import prisma from "~/lib/prisma";

type UserDetailsPageProps = {
  userId: number;
  user: User;
};

const UserDetailsPage = ({ userId, user }: UserDetailsPageProps) => {
  if (user == null) {
    return <p>User with ID #{userId} not found :(</p>;
  }

  return (
    <div>
      <div>
        <div>
          <h1>User #{userId}</h1>
          <h2>Name: {user.name}</h2>
        </div>
      </div>
    </div>
  );
};

type UserDetailsPageParams = {
  id: string;
};

export const getServerSideProps = async ({
  params,
}: {
  params: UserDetailsPageParams;
}) => {
  const { id } = params;
  const userId = parseInt(id);

  const user = await prisma.user.findUnique({ where: { id: userId } });

  return { props: { userId, user } };
};

export default UserDetailsPage;
