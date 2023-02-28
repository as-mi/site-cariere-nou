import { ReactElement } from "react";

import { GetServerSideProps } from "next";
import Link from "next/link";
import { useRouter } from "next/router";

import { Prisma, Role } from "@prisma/client";

import { getServerSession, redirectToLoginPage } from "~/lib/auth";
import prisma from "~/lib/prisma";
import { trpc } from "~/lib/trpc";

import { NextPageWithLayout } from "~/pages/_app";
import Layout from "~/components/pages/admin/layout";

const image = Prisma.validator<Prisma.ImageArgs>()({
  select: {
    id: true,
    fileName: true,
    contentType: true,
    width: true,
    height: true,
  },
});

type Image = Prisma.ImageGetPayload<typeof image>;

type PageProps = {
  imagesCount: number;
  images: Pick<Image, "id" | "fileName" | "contentType" | "width" | "height">[];
};

const AdminImagesPage: NextPageWithLayout<PageProps> = ({
  imagesCount,
  images,
}) => {
  const router = useRouter();

  const imageDeleteMutation = trpc.admin.image.delete.useMutation({
    onSuccess: () => router.reload(),
    onError: (error) => alert(`Eroare la ștergerea imaginii: ${error.message}`),
  });

  const handleImageDelete = (userId: number) => {
    if (window.confirm("Sigur vrei să ștergi această imagine?")) {
      imageDeleteMutation.mutate({ id: userId });
    }
  };

  return (
    <>
      <header>
        <h1 className="my-2 font-display text-3xl">Imagini</h1>
        <p className="my-2">
          {imagesCount == 1
            ? `Există o imagine`
            : `Sunt ${imagesCount} imagini`}{" "}
          în platformă.
        </p>
        <p className="my-4">
          <Link
            href="/admin/images/new"
            className="inline-block rounded-md bg-blue-600 py-2 px-3"
          >
            Încarcă o nouă imagine
          </Link>
        </p>
      </header>
      <div className="overflow-x-auto">
        <table className="w-full text-center">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nume fișier</th>
              <th>Tip fișier</th>
              <th>Dimensiuni</th>
              <th>Link</th>
              <th>Acțiuni</th>
            </tr>
          </thead>
          <tbody>
            {images.map((image) => {
              const url = `/api/images/${image.id}`;
              return (
                <tr key={image.id}>
                  <th scope="row" className="px-3">
                    {image.id}
                  </th>
                  <td className="px-3">{image.fileName}</td>
                  <td className="px-3">{image.contentType}</td>
                  <td className="px-3">
                    {image.width}x{image.height}
                  </td>
                  <td className="px-3">
                    <Link href={url} target="_blank">
                      {url}
                    </Link>
                  </td>
                  <td className="flex flex-col px-3">
                    <Link href={`/admin/images/${image.id}/edit`}>
                      Editează
                    </Link>
                    <button
                      onClick={() => handleImageDelete(image.id)}
                      className="block"
                    >
                      Șterge
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default AdminImagesPage;

AdminImagesPage.getLayout = (page: ReactElement) => (
  <Layout title="Imagini">{page}</Layout>
);

export const getServerSideProps: GetServerSideProps<PageProps> = async ({
  req,
  res,
  resolvedUrl,
}) => {
  const session = await getServerSession(req, res);

  const returnUrl = resolvedUrl;

  if (!session || !session.user) {
    return redirectToLoginPage(returnUrl);
  }

  if (session.user.role !== Role.ADMIN) {
    return {
      props: {
        session,
        imagesCount: 0,
        images: [],
      },
    };
  }

  const imagesCount = await prisma.image.count();
  const images = await prisma.image.findMany({
    ...image,
    orderBy: [{ id: "asc" }],
  });

  return {
    props: {
      session,
      imagesCount,
      images,
    },
  };
};
