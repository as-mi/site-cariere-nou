import Link from "next/link";

type AdminPositionApplicationsPageHeaderProps = {
  applicationsCount: number;
};

const AdminPositionApplicationsPageHeader: React.FC<
  AdminPositionApplicationsPageHeaderProps
> = ({ applicationsCount }) => (
  <header>
    <Link href="/admin/positions">Înapoi</Link>

    <h1 className="my-2 font-display text-3xl">Aplicanți</h1>

    <p className="my-2">
      {applicationsCount == 1
        ? `1 participant a aplicat`
        : `${applicationsCount}${
            applicationsCount > 0 ? " de" : ""
          } participanți au aplicat`}{" "}
      pe acest post.
    </p>
  </header>
);

export default AdminPositionApplicationsPageHeader;
