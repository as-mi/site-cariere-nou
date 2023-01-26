type LayoutProps = {
  children: React.ReactNode;
};

const Layout: React.FC<LayoutProps> = ({ children }) => (
  <div className="h-screen bg-black px-4 py-10">
    <main className="mx-auto max-w-sm rounded-lg bg-white px-3 py-5 text-black">
      {children}
    </main>
  </div>
);

export default Layout;
