import Head from "next/head";

type LayoutProps = {
  title: string;
  showSidebar?: boolean;
  children: React.ReactNode;
};

const Layout: React.FC<LayoutProps> = ({ title, showSidebar, children }) => (
  <>
    <Head>
      <title>{title}</title>
    </Head>
    {showSidebar && <aside></aside>}
    <main>{children}</main>
  </>
);

Layout.defaultProps = {
  showSidebar: true,
};

export default Layout;
