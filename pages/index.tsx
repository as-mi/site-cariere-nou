import Head from "next/head";

const Home: React.FC = () => (
  <>
    <Head>
      <title>Cariere v12.0</title>
      <meta
        name="description"
        content="Cariere este un târg de job-uri și internship-uri dedicat studenților"
      />
      <link rel="icon" href="/favicon.ico" />
    </Head>

    <main className="mt-10 text-center">
      <h1 className="p-3 text-5xl font-bold">Cariere v12.0</h1>

      <p className="p-3">Salut, ASMI!</p>
    </main>
  </>
);

export default Home;
