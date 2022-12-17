import { useSession, signIn, signOut } from "next-auth/react";
import { Button, Card, Container } from "react-bootstrap";

const LoginForm = () => {
  const { data: session } = useSession();

  const text = session ? (
    <>You&apos;re currently signed in as {session.user?.email}</>
  ) : (
    <>Not signed in</>
  );

  const button = session ? (
    <Button onClick={() => signOut()}>Sign out</Button>
  ) : (
    <Button onClick={() => signIn()}>Sign in</Button>
  );

  return (
    <Card style={{ maxWidth: "32em" }}>
      <Card.Body>
        <Card.Title>Login Form</Card.Title>
        <Card.Text>{text}</Card.Text>
        {button}
      </Card.Body>
    </Card>
  );
};

const LoginPage = () => {
  return (
    <Container className="mt-3">
      <LoginForm />
    </Container>
  );
};

export default LoginPage;
