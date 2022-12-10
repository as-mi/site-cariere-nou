import { Col, Container, Row } from "react-bootstrap";

import { PrismaClient, User } from "@prisma/client";

const prisma = new PrismaClient();

type UserDetailsPageProps = {
  userId: number;
  user: User;
};

const UserDetailsPage = ({ userId, user }: UserDetailsPageProps) => {
  if (user == null) {
    return <p>User with ID #{userId} not found :(</p>;
  }

  return (
    <Container>
      <Row>
        <Col>
          <h1>User #{userId}</h1>
          <h2>Name: {user.name}</h2>
        </Col>
      </Row>
    </Container>
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
