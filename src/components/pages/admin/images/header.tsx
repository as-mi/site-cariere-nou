import Link from "next/link";

import Button from "~/components/pages/admin/common/button";

type AdminImagesPageHeaderProps = {
  imagesCount: number;
};

const AdminImagesPageHeader: React.FC<AdminImagesPageHeaderProps> = ({
  imagesCount,
}) => (
  <header>
    <h1 className="my-2 font-display text-3xl">Imagini</h1>
    <p className="my-2">
      {imagesCount == 1 ? `Există o imagine` : `Sunt ${imagesCount} imagini`} în
      platformă.
    </p>
    <p className="my-4 flex flex-row flex-wrap justify-center gap-4 md:justify-start">
      <Button as={Link} href="/admin/images/new">
        Încarcă o nouă imagine
      </Button>
    </p>
  </header>
);

export default AdminImagesPageHeader;
