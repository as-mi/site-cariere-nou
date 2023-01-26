import { GetServerSideProps } from "next";

const AuthPage: React.FC = () => <></>;

export default AuthPage;

export const getServerSideProps: GetServerSideProps = async () => ({
  redirect: {
    destination: "/auth/login",
    permanent: true,
  },
});
