type AdminResumesPageHeaderProps = {
  resumesCount: number;
};

const AdminResumesPageHeader: React.FC<AdminResumesPageHeaderProps> = ({
  resumesCount,
}) => (
  <header>
    <h1 className="my-2 font-display text-3xl">CV-uri</h1>
    <p className="my-2">
      În platformă{" "}
      {resumesCount == 1
        ? `a fost încărcat 1 CV`
        : `au fost încărcate ${resumesCount} CV-uri`}
      .
    </p>
  </header>
);

export default AdminResumesPageHeader;
