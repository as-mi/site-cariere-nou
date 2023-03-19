import Link from "next/link";

type AdminTechnicalTestResponsesPageHeaderProps = {
  responsesCount: number;
};

const AdminTechnicalTestResponsesPageHeader: React.FC<
  AdminTechnicalTestResponsesPageHeaderProps
> = ({ responsesCount }) => (
  <header>
    <Link href="/admin/technical-tests">Înapoi</Link>

    <h1 className="my-2 font-display text-3xl">Respondenți</h1>

    <p className="my-2">
      {responsesCount == 1
        ? `1 participant a completat`
        : `${responsesCount}${
            responsesCount > 0 ? " de" : ""
          } participanți au completat`}{" "}
      testul tehnic.
    </p>
  </header>
);

export default AdminTechnicalTestResponsesPageHeader;
