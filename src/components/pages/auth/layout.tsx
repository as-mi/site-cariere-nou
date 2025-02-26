import CookieConsent from "~/components/common/cookie-consent";

type LayoutProps = {
  children: React.ReactNode;
};

const Layout: React.FC<LayoutProps> = ({ children }) => (
  <div className="min-h-screen bg-black px-4 py-10">
    <main className="mx-auto max-w-sm rounded-lg mt-20 bg-white px-3 py-5 text-black">
      {children}
    </main>

    <CookieConsent />
  </div>
);

export default Layout;
