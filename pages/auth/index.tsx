import { GetStaticProps } from "next";

const AuthPage: React.FC = () => <></>;

export default AuthPage;

export const getStaticProps: GetStaticProps = () => ({
  redirect: {
    destination: "/auth/login",
    permanent: true,
  },
});
