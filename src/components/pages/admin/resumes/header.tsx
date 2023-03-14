import Link from "next/link";

import Button from "~/components/pages/admin/common/button";

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
    <p className="my-4 flex flex-row flex-wrap items-center justify-center gap-4 sm:justify-start">
      <Button
        as={Link}
        href="/api/resumes/download?onlyConsentedToApplyToOtherPartners=false"
      >
        Descarcă toate CV-urile din baza de date
      </Button>
      <Button
        as={Link}
        href="/api/resumes/download?onlyConsentedToApplyToOtherPartners=true"
      >
        Descarcă CV-urile candidaților care au fost de acord să le fie trimise
        datele și la partenerii la care nu au aplicat
      </Button>
    </p>
  </header>
);

export default AdminResumesPageHeader;
